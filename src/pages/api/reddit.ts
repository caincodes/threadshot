import type { APIRoute } from "astro";

import {
  assertLocal,
  NotLocalError,
  redditFetch,
  RedditBlockedError,
  userAgentOf,
} from "../../server/reddit";

const SAFE = /^[\w-]+$/;
const SORTS = new Set([
  "best",
  "confidence",
  "top",
  "new",
  "controversial",
  "old",
  "qa",
  "random",
]);

const json = (body: unknown, status = 200) => Response.json(body, { status });

export const GET: APIRoute = async (context) => {
  const { url, request } = context;

  try {
    assertLocal(url, () => context.clientAddress);
  } catch (error) {
    return json({ error: (error as NotLocalError).message }, 403);
  }

  const sub = url.searchParams.get("sub");
  const postId = url.searchParams.get("postId");
  const commentId = url.searchParams.get("commentId");
  const sort = url.searchParams.get("sort") || "confidence";

  if (
    !sub ||
    !postId ||
    !SAFE.test(sub) ||
    !SAFE.test(postId) ||
    (commentId && !SAFE.test(commentId)) ||
    !SORTS.has(sort)
  ) {
    return json({ error: "Invalid parameters" }, 400);
  }

  try {
    const path = commentId
      ? `/r/${sub}/comments/${postId}/title/${commentId}.json?context=10000&raw_json=1&sort=${sort}`
      : `/r/${sub}/comments/${postId}/.json?raw_json=1&sort=${sort}`;
    const upstream = await redditFetch(path, { userAgent: userAgentOf(request) });

    if (upstream.status === 403 || upstream.status === 429) {
      throw new RedditBlockedError(upstream.status);
    }
    if (upstream.status === 404) {
      return json({ error: "Reddit could not find that post." }, 404);
    }
    if (!upstream.ok) {
      return json({ error: `Reddit returned ${upstream.status}.` }, 502);
    }

    return new Response(await upstream.text(), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return json({ error: (error as Error).message }, 502);
  }
};
