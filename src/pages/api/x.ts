import type { APIRoute } from "astro";

import { createRateLimit } from "../../server/rateLimit";
import { fetchXPost, X_POST_ID, XApiError } from "../../server/x";

// A person makes a handful of these; a scraper makes thousands.
const isLimited = createRateLimit({ limit: 30, windowMs: 60_000 });

// A post is served from Vercel's cache for an hour, and a day more while it
// refreshes, so repeat requests for the same post never reach X. Counts can lag
// by that much, which an image of a post can live with.
const CACHED = {
  "Cache-Control": "public, max-age=300",
  "CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};
const NOT_FOUND_CACHE = { "Cache-Control": "public, max-age=60, s-maxage=60" };
const NOT_CACHED = { "Cache-Control": "no-store" };

const json = (body: unknown, status: number, headers: HeadersInit) =>
  Response.json(body, { status, headers });

// Vercel sets x-real-ip; Astro throws if it can't tell the address at all.
const visitorOf = (request: Request, address: () => string) => {
  const header = request.headers.get("x-real-ip");
  if (header) {
    return header;
  }
  try {
    return address();
  } catch {
    return "unknown";
  }
};

export const GET: APIRoute = async (context) => {
  const { url, request } = context;
  // Browsers say where a request came from, so other sites' pages can't use
  // this server to fetch posts. Tools that send no such header are only limited.
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return json({ error: "Cross-site requests are not allowed." }, 403, NOT_CACHED);
  }

  const id = url.searchParams.get("id") ?? "";
  if (!X_POST_ID.test(id)) {
    return json({ error: "Invalid post id" }, 400, NOT_CACHED);
  }

  const retryAfter = isLimited(
    visitorOf(request, () => context.clientAddress)
  );
  if (retryAfter) {
    return json(
      { error: "Too many posts loaded at once. Wait a minute and try again." },
      429,
      { ...NOT_CACHED, "Retry-After": String(retryAfter) }
    );
  }

  try {
    return json(await fetchXPost(id), 200, CACHED);
  } catch (error) {
    const status = error instanceof XApiError ? error.status : 502;
    return json(
      { error: (error as Error).message },
      status,
      status === 404 ? NOT_FOUND_CACHE : NOT_CACHED
    );
  }
};
