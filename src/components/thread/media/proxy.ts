// Images from Reddit's and X's CDNs are routed through our own proxy so that
// modern-screenshot can read them when generating the screenshot. The sample
// posts' pictures are served from this site already.
export const proxiedImageSrc = (src: string) =>
  src.startsWith("/") ? src : `/api/img?u=${encodeURIComponent(src)}`;

// X serves its pictures at a named size unless the URL already picks one.
export const xImageSrc = (url: string, size: "small" | "large" = "large") =>
  proxiedImageSrc(
    url.startsWith("/") || url.includes("?") ? url : `${url}?name=${size}`
  );
