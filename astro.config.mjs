import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";

export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [svelte()],
  vite: { plugins: [tailwindcss()] },
  env: {
    schema: {
      REDDIT_CLIENT_ID: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      REDDIT_CLIENT_SECRET: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },
});
