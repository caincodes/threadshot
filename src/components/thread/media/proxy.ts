// Reddit-hosted images are loaded through a same-origin proxy so that
// html-to-image can read them when generating the screenshot.
export const proxiedImageSrc = (src: string) =>
  `/api/img?u=${encodeURIComponent(src)}`;
