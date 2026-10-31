// The site's public host for the image watermark, taken from Astro's `site`
// (set at build time in astro.config.mjs). Shown without protocol, "www.",
// slashes or any path, e.g. "threadshot-for-reddit.vercel.app".
export const toDisplayHost = (value: string | undefined): string | undefined => {
  const raw = value?.trim();
  if (!raw) {
    return undefined;
  }

  try {
    const hasProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(raw);
    const { host } = new URL(hasProtocol ? raw : `https://${raw}`);
    return host.replace(/^www\./, "") || undefined;
  } catch {
    return undefined;
  }
};

export const siteHost = toDisplayHost(import.meta.env.SITE);
