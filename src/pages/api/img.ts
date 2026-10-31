import type { APIRoute } from "astro";

import {
  assertLocal,
  NotLocalError,
  userAgentOf,
} from "../../server/reddit";

// Same-origin proxy so modern-screenshot can read Reddit-hosted images (CORS).
const ALLOWED_HOST = /(^|\.)(redd\.it|redditmedia\.com|redditstatic\.com)$/;

export const GET: APIRoute = async (context) => {
  const { url, request } = context;
  try {
    assertLocal(url, () => context.clientAddress);
  } catch (error) {
    return new Response((error as NotLocalError).message, { status: 403 });
  }

  let target: URL;
  try {
    target = new URL(url.searchParams.get("u") ?? "");
  } catch {
    return new Response("Invalid url", { status: 400 });
  }
  if (target.protocol !== "https:" || !ALLOWED_HOST.test(target.hostname)) {
    return new Response("Host not allowed", { status: 400 });
  }

  const upstream = await fetch(target, {
    redirect: "error",
    headers: { "User-Agent": userAgentOf(request) },
  }).catch(() => null);
  const type = upstream?.headers.get("content-type") ?? "";
  if (!upstream?.ok || !type.startsWith("image/")) {
    return new Response("Upstream image unavailable", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
};
