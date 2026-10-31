import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";

export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [react()],
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
      REDDIT_MOCK: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },
});
