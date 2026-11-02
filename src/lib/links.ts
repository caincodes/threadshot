// Turns a link to a post on X or Reddit into the editor address that loads it.
// Shared by the home page's link fields and /open (the share target).

const X_HOSTS =
  /^(?:www\.|mobile\.)?(?:x|twitter|fxtwitter|vxtwitter|fixupx|fixvx)\.com$/i;
// This site, so an X link with its host swapped for threadshot.app works too.
const OWN_HOSTS = /(?:^|\.)threadshot\.app$/i;
const X_STATUS_PATH = /^\/(?:\w+|i(?:\/web)?)\/status(?:es)?\/(\d{1,25})(?:\/|$)/;

const REDDIT_POST_PATH = /^\/r\/([\w-]+)\/comments\/(\w+)(?:\/[^/]*)?(?:\/(\w+))?/;
const REDDIT_SHARE_PATH = /^\/r\/([\w-]+)\/s\/([\w-]+)/;

// The post id in an x.com or twitter.com link, or null for anything else.
// `ownHost` is the host this page is served from (a preview or local copy).
export const xPostIdFrom = (url: URL, ownHost?: string): string | null =>
  X_HOSTS.test(url.hostname) ||
  OWN_HOSTS.test(url.hostname) ||
  (ownHost !== undefined && url.host === ownHost)
    ? (X_STATUS_PATH.exec(url.pathname)?.[1] ?? null)
    : null;

export type LinkTarget =
  | { platform: "x"; path: string }
  | { platform: "reddit"; path: string };

export const editorTargetFor = (
  url: URL,
  ownHost?: string
): LinkTarget | null => {
  const xPostId = xPostIdFrom(url, ownHost);
  if (xPostId) {
    return {
      platform: "x",
      path: `/generate?${new URLSearchParams({ x: xPostId })}`,
    };
  }
  // Any host, so reddit links with the host swapped for this site work too.
  const post = REDDIT_POST_PATH.exec(url.pathname);
  const share = REDDIT_SHARE_PATH.exec(url.pathname);
  const params = new URLSearchParams();
  if (post) {
    params.set("sub", post[1]);
    params.set("postId", post[2]);
    if (post[3]) params.set("commentId", post[3]);
  } else if (share) {
    params.set("sub", share[1]);
    params.set("share", share[2]);
  } else {
    return null;
  }
  return { platform: "reddit", path: `/generate?${params}` };
};

const URL_IN_TEXT = /https?:\/\/[^\s<>"']+/gi;
// Punctuation that ends a sentence rather than the link: "see x.com/a/status/1."
const TRAILING_PUNCTUATION = /[.,;:!?)\]}]+$/;

// The first link in some shared or pasted text that points at a post.
export const editorTargetInText = (
  text: string,
  ownHost?: string
): LinkTarget | null => {
  for (const [match] of text.matchAll(URL_IN_TEXT)) {
    try {
      const link = match.replace(TRAILING_PUNCTUATION, "");
      const target = editorTargetFor(new URL(link), ownHost);
      if (target) {
        return target;
      }
    } catch {
      // Not a usable link; try the next one.
    }
  }
  return null;
};
