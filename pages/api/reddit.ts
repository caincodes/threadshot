import type { NextApiRequest, NextApiResponse } from "next";

import { mockRedditResponse } from "../../src/server/mockReddit";
import { hasRedditCredentials, redditFetch } from "../../src/server/redditAuth";

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

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const sub = first(req.query.sub);
  const postId = first(req.query.postId);
  const commentId = first(req.query.commentId);
  const sort = first(req.query.sort) || "confidence";

  if (
    !sub ||
    !postId ||
    !SAFE.test(sub) ||
    !SAFE.test(postId) ||
    (commentId && !SAFE.test(commentId)) ||
    !SORTS.has(sort)
  ) {
    res.status(400).json({ error: "Invalid parameters" });
    return;
  }

  if (process.env.REDDIT_MOCK === "1") {
    res.status(200).json(mockRedditResponse(commentId));
    return;
  }

  try {
    const path = commentId
      ? `/r/${sub}/comments/${postId}/title/${commentId}.json?context=10000&raw_json=1&sort=${sort}`
      : `/r/${sub}/comments/${postId}/.json?raw_json=1&sort=${sort}`;
    const upstream = await redditFetch(path);
    if (!upstream.ok && !hasRedditCredentials()) {
      res.status(502).json({
        error: `Reddit refused the unauthenticated request (${upstream.status}). Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET.`,
      });
      return;
    }
    const body = await upstream.text();
    res
      .status(upstream.status)
      .setHeader("Content-Type", "application/json")
      .setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300")
      .send(body);
  } catch (error) {
    res.status(502).json({ error: (error as Error).message });
  }
}
