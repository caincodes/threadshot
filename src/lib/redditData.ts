import { parseComments } from "../functions/util/parseComments";
import { parseSubmission } from "../functions/util/parseSubmission";
import type {
  CommentSort,
  ListedRawComment,
  ListedRawSubmission,
  Listing,
  MoreChildren,
  RedditComment,
  RedditSubmission,
} from "../types/reddit";
import type { Credentials } from "./credentials.svelte";
import { sampleRedditResponse } from "./sampleThread";
import { sanitizeHtml } from "./sanitizeHtml";

export type RedditData = [
  RedditSubmission,
  Array<RedditComment | MoreChildren>,
];

type Comments = Array<RedditComment | MoreChildren>;

// reddit sorts server-side for real posts; the sample sorts itself the same
// way. "best" keeps the fixture's order. Pinned comments stay first in any sort.
const comparators: Record<
  CommentSort,
  ((a: RedditComment, b: RedditComment) => number) | null
> = {
  best: null,
  top: (a, b) => b.score - a.score,
  old: (a, b) => a.created_utc - b.created_utc,
  controversial: (a, b) =>
    (b.controversiality ?? 0) - (a.controversiality ?? 0) ||
    b.score - a.score,
};

const sortComments = (list: Comments, sort: CommentSort): Comments => {
  const compare = comparators[sort];
  const sorted = list.map((item) =>
    item.type === "comment"
      ? { ...item, replyTree: sortComments(item.replyTree, sort) }
      : item
  );
  return compare
    ? sorted.sort((a, b) =>
        a.type === "comment" && b.type === "comment"
          ? Number(b.stickied) - Number(a.stickied) || compare(a, b)
          : 0
      )
    : sorted;
};

// Profile pictures by account fullname (t2_...).
export type UserIcons = Record<string, string>;

const prepareComments = (list: Comments, icons: UserIcons): Comments =>
  list.map((item) =>
    item.type === "comment"
      ? {
          ...item,
          body_html: sanitizeHtml(item.body_html),
          authorIcon: iconFor(item.author_fullname, icons),
          replyTree: prepareComments(item.replyTree, icons),
        }
      : item
  );

const iconFor = (fullname: string | undefined, icons: UserIcons) =>
  (fullname && icons[fullname]) || undefined;

// Only https images; the image proxy narrows them further to Reddit's hosts.
const isImageUrl = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("https://");

export const isUserIcons = (value: unknown): value is UserIcons =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every(isImageUrl);

const MAX_ICON_USERS = 500;

// Every author in the thread, for looking up their profile pictures.
export const authorIds = (thread: RawThread): string[] => {
  const ids = new Set<string>();
  const walk = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(walk);
    } else if (node && typeof node === "object") {
      const { author_fullname } = node as { author_fullname?: unknown };
      if (typeof author_fullname === "string") {
        ids.add(author_fullname);
      }
      Object.values(node).forEach(walk);
    }
  };
  walk(thread);
  return [...ids].slice(0, MAX_ICON_USERS);
};

// Parse a raw reddit thread (the sample, or data sent from Reddit) and apply the
// chosen sort, since nothing server-side sorts it for us. Every thread the
// browser receives passes through here, so this is where its HTML is cleaned.
export const parseThread = (
  thread: RawThread,
  sort: CommentSort = "best",
  icons: UserIcons = {}
): RedditData => {
  const [submissionListing, commentListing] = thread;
  const modhash = submissionListing.data.modhash ?? "";
  const submission = parseSubmission(
    submissionListing.data.children[0].data,
    modhash
  );
  const community = submission.sr_detail;
  const subredditIcon = [community?.community_icon, community?.icon_img].find(
    isImageUrl
  );
  return [
    {
      ...submission,
      selftext_html:
        submission.selftext_html && sanitizeHtml(submission.selftext_html),
      subredditIcon,
    },
    sortComments(
      prepareComments(
        parseComments(commentListing.data.children, modhash),
        icons
      ),
      sort
    ),
  ];
};

// The bundled sample thread, parsed exactly like a real response. Its people
// get Reddit's default avatars; the subreddit icon is its own.
export const loadSampleData = (sort: CommentSort = "best"): RedditData => {
  const [submission, comments] = parseThread(sampleRedditResponse(), sort);
  return [{ ...submission, subredditIcon: "/sample/woodworking.svg" }, comments];
};

// Guards data that arrives from outside (a window message) before it is parsed.
export const isRawThread = (value: unknown): value is RawThread => {
  if (!Array.isArray(value) || value.length < 2) {
    return false;
  }
  const [post, comments] = value as Array<{
    kind?: string;
    data?: { children?: Array<{ kind?: string }> };
  }>;
  return (
    post?.kind === "Listing" &&
    Array.isArray(post.data?.children) &&
    post.data.children[0]?.kind === "t3" &&
    comments?.kind === "Listing" &&
    Array.isArray(comments.data?.children)
  );
};

export type RawThread = [
  Listing<ListedRawSubmission>,
  Listing<ListedRawComment>,
];

// A failure that came with an explanation from our own server. `code` is
// "credentials" when the visitor's Reddit credentials were the problem.
export class RedditRequestError extends Error {
  constructor(
    message: string,
    readonly code?: string
  ) {
    super(message);
  }
}

// What to load: a post by id, or a share link that has to be resolved first.
export interface ThreadTarget {
  subreddit: string;
  postId: string | null;
  commentId: string | null;
  shareCode: string | null;
}

const SORT_PARAM: Record<CommentSort, string> = {
  best: "confidence",
  top: "top",
  controversial: "controversial",
  old: "old",
};

// POST so the credentials stay out of URLs, logs and history.
const post = async <T>(
  endpoint: string,
  body: Record<string, unknown>,
  credentials: Credentials,
  signal?: AbortSignal
): Promise<T> => {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, credentials }),
    signal,
  });
  if (!res.ok) {
    const failure = await res.json().catch(() => null);
    throw new RedditRequestError(
      failure?.error ?? `Request failed (${res.status})`,
      failure?.code
    );
  }
  return res.json() as Promise<T>;
};

const resolvedShares = new Map<string, { postId: string; commentId: string | null }>();

const resolveShare = async (
  subreddit: string,
  shareCode: string,
  credentials: Credentials,
  signal?: AbortSignal
) => {
  const key = `${subreddit}/${shareCode}`;
  const cached = resolvedShares.get(key);
  if (cached) {
    return cached;
  }
  const resolved = await post<{ postId: string; commentId: string | null }>(
    "/api/resolve",
    { sub: subreddit, code: shareCode },
    credentials,
    signal
  );
  resolvedShares.set(key, resolved);
  return resolved;
};

export const fetchRedditData = async (
  target: ThreadTarget,
  sort: CommentSort,
  credentials: Credentials,
  signal?: AbortSignal
): Promise<RedditData> => {
  let { postId, commentId } = target;

  if (!postId && target.shareCode) {
    const resolved = await resolveShare(
      target.subreddit,
      target.shareCode,
      credentials,
      signal
    );
    postId = resolved.postId;
    commentId = resolved.commentId;
  }
  if (!postId) {
    throw new RedditRequestError("That link does not point to a Reddit post.");
  }

  const thread = await post<RawThread>(
    "/api/reddit",
    {
      sub: target.subreddit,
      postId,
      commentId: commentId ?? undefined,
      sort: SORT_PARAM[sort],
    },
    credentials,
    signal
  );
  // Profile pictures are a nicety, so the thread still loads without them.
  const icons = await post<UserIcons>(
    "/api/users",
    { ids: authorIds(thread) },
    credentials,
    signal
  ).catch((error) => {
    if (signal?.aborted) {
      throw error;
    }
    return {};
  });
  return parseThread(thread, "best", isUserIcons(icons) ? icons : {});
};
