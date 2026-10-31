import type { NextApiRequest, NextApiResponse } from "next";

import { redditFetch } from "../../src/server/redditAuth";

const SHARE = /^\/r\/([\w-]+)\/s\/([\w-]+)\/?$/;
const POST = /\/r\/([\w-]+)\/comments\/(\w+)(?:\/[^/]*)?(?:\/(\w+))?/;

// Resolves a reddit.com/r/{sub}/s/{code} share link to its sub/post/comment ids.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const match = SHARE.exec(String(req.query.path || ""));
  if (!match) {
    res.status(400).json({ error: "Not a share link" });
    return;
  }

  if (process.env.REDDIT_MOCK === "1") {
    res.status(200).json({ sub: "mocksub", postId: "mock01", commentId: null });
    return;
  }

  try {
    const upstream = await redditFetch(`/r/${match[1]}/s/${match[2]}`, {
      redirect: "manual",
    });
    const location = upstream.headers.get("location");
    const target = location && POST.exec(new URL(location, "https://www.reddit.com").pathname);
    if (!target) {
      res.status(404).json({ error: "Could not resolve share link" });
      return;
    }
    res.status(200).json({
      sub: target[1],
      postId: target[2],
      commentId: target[3] || null,
    });
  } catch (error) {
    res.status(502).json({ error: (error as Error).message });
  }
}
