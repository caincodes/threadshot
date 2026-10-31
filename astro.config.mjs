import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// The public site URL, filled in at build time so the image watermark can show
// it. On Vercel this is the project's production domain; elsewhere set
// SITE_URL. Without either, the watermark simply omits the URL.
const siteDomain =
  process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;

export default defineConfig({
  site: siteDomain
    ? /^https?:\/\//i.test(siteDomain)
      ? siteDomain
      : `https://${siteDomain}`
    : undefined,
  output: "server",
  adapter: vercel(),
  integrations: [svelte()],
  vite: { plugins: [tailwindcss()] },
});
