import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// The public site URL, used for canonical links. It is threadshot.app unless
// SITE_URL overrides it (for a fork or a staging copy).
const siteDomain = process.env.SITE_URL || "threadshot.app";

export default defineConfig({
  site: /^https?:\/\//i.test(siteDomain) ? siteDomain : `https://${siteDomain}`,
  output: "server",
  adapter: vercel(),
  integrations: [svelte()],
  vite: { plugins: [tailwindcss()] },
});
