import { isMockMode, redditFetch } from "./redditAuth";

const POST = /\/r\/([\w-]+)\/comments\/(\w+)(?:\/[^/]*)?(?:\/(\w+))?/;

export interface ResolvedPost {
  sub: string;
  postId: string;
  commentId: string | null;
}

// Resolves a reddit.com/r/{sub}/s/{code} share link to its sub/post/comment ids.
export const resolveShareLink = async (
  sub: string,
  code: string
): Promise<ResolvedPost | null> => {
  if (isMockMode) {
    return { sub: "mocksub", postId: "mock01", commentId: null };
  }

  const upstream = await redditFetch(`/r/${sub}/s/${code}`, {
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
