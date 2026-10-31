import { redditFetch } from "./reddit";

const POST = /\/r\/([\w-]+)\/comments\/(\w+)(?:\/[^/]*)?(?:\/(\w+))?/;

export interface ResolvedPost {
  sub: string;
  postId: string;
  commentId: string | null;
}

// Resolves a reddit.com/r/{sub}/s/{code} share link to its sub/post/comment ids.
export const resolveShareLink = async (
  sub: string,
  code: string,
  userAgent: string
): Promise<ResolvedPost | null> => {
  const upstream = await redditFetch(`/r/${sub}/s/${code}`, {
    userAgent,
    redirect: "manual",
  });
  const location = upstream.headers.get("location");
  const target =
    location && POST.exec(new URL(location, "https://www.reddit.com").pathname);
  if (!target) {
    return null;
  }
  return { sub: target[1], postId: target[2], commentId: target[3] || null };
};
