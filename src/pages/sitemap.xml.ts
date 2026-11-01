import type { APIRoute } from "astro";

// The editor and its redirects have no content of their own, so only the
// pages worth finding are listed.
const PAGES = ["/", "/get-a-key"];

export const GET: APIRoute = ({ site }) =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map((path) => `  <url><loc>${new URL(path, site).href}</loc></url>`).join("\n")}
</urlset>
`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } }
  );
