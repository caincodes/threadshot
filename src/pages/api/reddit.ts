import type { APIRoute } from "astro";

import { mockRedditResponse } from "../../server/mockReddit";
import {
  hasRedditCredentials,
  isMockMode,
  redditFetch,
} from "../../server/redditAuth";

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

const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  Response.json(body, { status, headers });

export const GET: APIRoute = async ({ url }) => {
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

  if (isMockMode) {
    return json(mockRedditResponse(commentId ?? undefined));
  }

  try {
    const path = commentId
      ? `/r/${sub}/comments/${postId}/title/${commentId}.json?context=10000&raw_json=1&sort=${sort}`
      : `/r/${sub}/comments/${postId}/.json?raw_json=1&sort=${sort}`;
    const upstream = await redditFetch(path);
    if (!upstream.ok && !hasRedditCredentials()) {
      return json(
        {
          error: `Reddit refused the unauthenticated request (${upstream.status}). Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET.`,
        },
        502
      );
    }
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    return json({ error: (error as Error).message }, 502);
  }
};
