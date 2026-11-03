// Reddit-hosted images are loaded through a same-origin proxy so that
// modern-screenshot can read them when generating the screenshot.
export const proxiedImageSrc = (src: string) =>
  `/api/img?u=${encodeURIComponent(src)}`;

// X serves its pictures at a named size unless the URL already picks one.
export const xImageSrc = (url: string, size: "small" | "large" = "large") =>
  proxiedImageSrc(url.includes("?") ? url : `${url}?name=${size}`);
