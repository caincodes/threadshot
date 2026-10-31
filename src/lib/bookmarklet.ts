// A bookmark that runs on a reddit.com post page. Because it runs on reddit.com
// itself, the request for the post's JSON is an ordinary same-origin load with
// the visitor's own session, IP and user agent. It then hands the result to
// this app in a new window with postMessage, so nothing is fetched by a server.
//
// Each click carries a one-time nonce in the window's URL and in every message.
// The window is reused between clicks, and the page it is replacing can still
// answer for a moment; the nonce makes only the freshly loaded page accept data
// and acknowledge it, so the bookmark never stops sending too early.

export const BOOKMARK_MESSAGE = "threadshot:thread";
export const BOOKMARK_ACK = "threadshot:ack";

// Pages that may send a thread to the editor.
export const REDDIT_ORIGINS = new Set([
  "https://www.reddit.com",
  "https://old.reddit.com",
  "https://reddit.com",
]);

export const bookmarkletHref = (appOrigin: string): string => {
  const source = `(() => {
  const origin = ${JSON.stringify(appOrigin)};
  if (!/^\\/r\\/[\\w-]+\\/comments\\/\\w+/.test(location.pathname)) {
    alert("Open a Reddit post first, then click this bookmark again.");
    return;
  }
  const nonce = Math.random().toString(36).slice(2);
  const target = window.open(origin + "/generate?from=reddit&n=" + nonce, "threadshot");
  if (!target) {
    alert("Your browser blocked the pop-up. Allow pop-ups and try again. On an iPhone or iPad, turn off Block Pop-ups in Safari's settings.");
    return;
  }
  const path = location.pathname.replace(/\\/$/, "");
  fetch(path + ".json?raw_json=1&context=10000&limit=500&sr_detail=1")
    .then((response) => {
      if (!response.ok) throw new Error("Reddit answered " + response.status);
      return response.json();
    })
    .then((data) => {
      // Profile pictures are optional, so a failed lookup still sends the thread.
      const ids = new Set();
      const walk = (node) => {
        if (Array.isArray(node)) node.forEach(walk);
        else if (node && typeof node === "object") {
          if (typeof node.author_fullname === "string") ids.add(node.author_fullname);
          Object.values(node).forEach(walk);
        }
      };
      walk(data);
      const list = [...ids].slice(0, 500);
      const batches = [];
      for (let i = 0; i < list.length; i += 100) batches.push(list.slice(i, i + 100));
      return Promise.all(batches.map((batch) =>
        fetch("/api/user_data_by_account_ids.json?ids=" + batch.join(","))
          .then((response) => (response.ok ? response.json() : {}))
          .catch(() => ({}))
      )).then((parts) => {
        const users = {};
        parts.forEach((part) => Object.entries(part || {}).forEach(([id, user]) => {
          if (user && typeof user.profile_img === "string") users[id] = user.profile_img.replaceAll("&amp;", "&");
        }));
        return { data, users };
      });
    })
    .then(({ data, users }) => {
      const send = () => target.postMessage({ type: ${JSON.stringify(BOOKMARK_MESSAGE)}, nonce, data, users }, origin);
      send();
      const timer = setInterval(send, 400);
      addEventListener("message", (event) => {
        if (event.origin === origin && event.data === ${JSON.stringify(BOOKMARK_ACK)}) clearInterval(timer);
      });
      setTimeout(() => clearInterval(timer), 20000);
    })
    .catch((error) => {
      target.close();
      alert("Could not read this page from Reddit: " + error.message);
    });
})();`;
  return `javascript:${encodeURIComponent(source)}`;
};
