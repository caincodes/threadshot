import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { execSync } from "node:child_process";

// The public site URL, used for canonical links. It is threadshot.app unless
// SITE_URL overrides it (for a fork or a staging copy).
const siteDomain = process.env.SITE_URL || "threadshot.app";

// Vercel names the commit it is building, and may not have a .git folder.
const fullCommit = () => {
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA;
  }
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8", stdio: "pipe" }).trim();
  } catch {
    return null;
  }
};

export default defineConfig({
  site: /^https?:\/\//i.test(siteDomain) ? siteDomain : `https://${siteDomain}`,
  output: "server",
  devToolbar: { enabled: false },
  adapter: vercel(),
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
    // Compiled in here because pages render per request in server output, where
    // a new Date() would be the time of the visit rather than of the build.
    define: {
      __BUILD_COMMIT__: JSON.stringify(fullCommit()),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
  },
});
