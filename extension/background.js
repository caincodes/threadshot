// The toolbar button runs the same steps as the bookmark in
// src/lib/bookmarklet.ts, so keep the two in step. The script runs in the page
// itself so the request for the post's JSON is an ordinary same-origin load.
//
// `func` is copied into the page, so it cannot use anything from this file.
browser.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;

  try {
    await browser.scripting.executeScript({
      target: { tabId: tab.id },
      world: "MAIN",
      func: () => {
        const origin = "https://threadshot.app";
        if (!/^\/r\/[\w-]+\/comments\/\w+/.test(location.pathname)) {
          alert("Open a Reddit post first, then click this button again.");
          return;
        }
        const nonce = Math.random().toString(36).slice(2);
        const target = window.open(origin + "/generate?from=reddit&n=" + nonce, "threadshot");
        if (!target) {
          alert("Your browser blocked the pop-up. Allow pop-ups and try again. On an iPhone or iPad, turn off Block Pop-ups in Safari's settings.");
          return;
        }
        const path = location.pathname.replace(/\/$/, "");
        fetch(path + ".json?raw_json=1&context=10000&limit=500")
          .then((response) => {
            if (!response.ok) throw new Error("Reddit answered " + response.status);
            return response.json();
          })
          .then((data) => {
            const send = () => target.postMessage({ type: "threadshot:thread", nonce, data }, origin);
            send();
            const timer = setInterval(send, 400);
            addEventListener("message", (event) => {
              if (event.origin === origin && event.data === "threadshot:ack") clearInterval(timer);
            });
            setTimeout(() => clearInterval(timer), 20000);
          })
          .catch((error) => {
            target.close();
            alert("Could not read this page from Reddit: " + error.message);
          });
      },
    });
  } catch (error) {
    console.error("Failed to execute script: " + error);
  }
});
