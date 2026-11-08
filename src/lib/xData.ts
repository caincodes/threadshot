import type { XPost } from "../types/x";
import { sanitizeHtml } from "./sanitizeHtml";

const isHttpsUrl = (value: unknown) =>
  value === undefined || (typeof value === "string" && value.startsWith("https://"));

const isPost = (value: unknown, depth = 0): value is XPost => {
  const post = value as Partial<XPost> | null;
  return (
    typeof post === "object" &&
    post !== null &&
    typeof post.id === "string" &&
    typeof post.html === "string" &&
    typeof post.createdUtc === "number" &&
    typeof post.author?.name === "string" &&
    typeof post.author.handle === "string" &&
    isHttpsUrl(post.author.avatar) &&
    Array.isArray(post.media) &&
    post.media.every((item) => isHttpsUrl(item?.url)) &&
    isHttpsUrl(post.card?.image) &&
    depth < 3 &&
    (post.quoted === undefined || isPost(post.quoted, depth + 1)) &&
    (post.parent === undefined || isPost(post.parent, depth + 1))
  );
};

const cleaned = (post: XPost): XPost => ({
  ...post,
  html: sanitizeHtml(post.html),
  quoted: post.quoted && cleaned(post.quoted),
  parent: post.parent && cleaned(post.parent),
});

export const fetchXPost = async (
  id: string,
  signal?: AbortSignal
): Promise<XPost> => {
  const res = await fetch(`/api/x?${new URLSearchParams({ id })}`, { signal });
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (body as { error?: unknown } | null)?.error;
    throw new Error(typeof message === "string" ? message : `Request failed (${res.status})`);
  }
  if (!isPost(body)) {
    throw new Error("X sent a post this app can't read.");
  }
  return cleaned(body);
};
