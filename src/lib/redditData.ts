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
import { sampleRedditResponse } from "./sampleThread";

export type RedditData = [
  RedditSubmission,
  Array<RedditComment | MoreChildren>,
];

type Comments = Array<RedditComment | MoreChildren>;

// reddit sorts server-side for real posts; the sample sorts itself the same
// way. "best" keeps the fixture's order.
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
        a.type === "comment" && b.type === "comment" ? compare(a, b) : 0
      )
    : sorted;
};

// The bundled sample thread, parsed exactly like a real response.
export const loadSampleData = (sort: CommentSort = "best"): RedditData => {
  const [submissionListing, commentListing] = sampleRedditResponse();
  return [
    parseSubmission(submissionListing.data.children[0].data, ""),
    sortComments(parseComments(commentListing.data.children, ""), sort),
  ];
};

type RawThread = [Listing<ListedRawSubmission>, Listing<ListedRawComment>];

const SORT_PARAM: Record<CommentSort, string> = {
  best: "confidence",
  top: "top",
  controversial: "controversial",
  old: "old",
};

// Reddit's public JSON for a post, or for one comment in context.
const redditPath = (
  subreddit: string,
  postId: string,
  commentId: string | null,
  sort: CommentSort
) =>
  commentId
    ? `/r/${subreddit}/comments/${postId}/title/${commentId}.json?context=10000&raw_json=1&sort=${SORT_PARAM[sort]}`
    : `/r/${subreddit}/comments/${postId}/.json?raw_json=1&sort=${SORT_PARAM[sort]}`;

// Local-only mode tries Reddit straight from the browser first: that request
// carries the browser's own user agent, headers and connection, which Reddit is
// far less likely to refuse than a request made by the server. If the browser
// is not allowed to read the response (CORS) or Reddit refuses it, fall back
// to the local server, and report what each attempt got if both fail.
const fetchFromBrowser = async (
  path: string,
  signal?: AbortSignal
): Promise<{ thread?: RawThread; note?: string }> => {
  try {
    const res = await fetch(`https://www.reddit.com${path}`, { signal });
    if (res.ok) {
      return { thread: (await res.json()) as RawThread };
    }
    return { note: `Reddit answered your browser with ${res.status}` };
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    return { note: "your browser was not allowed to read Reddit's response (CORS)" };
  }
};

export const fetchRedditData = async (
  subreddit: string,
  postId: string,
  commentId: string | null,
  sort: CommentSort,
  signal?: AbortSignal
): Promise<RedditData> => {
  const direct = await fetchFromBrowser(
    redditPath(subreddit, postId, commentId, sort),
    signal
  );
  let thread = direct.thread;

  if (!thread) {
    const params = new URLSearchParams({ sub: subreddit, postId, sort });
    if (commentId) {
      params.set("commentId", commentId);
    }

    const res = await fetch(`/api/reddit?${params}`, { signal });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message = body?.error ?? `Request failed (${res.status})`;
      throw new Error(`${message} Tried your browser first: ${direct.note}.`);
    }
    thread = (await res.json()) as RawThread;
  }

  const [submissionListing, commentListing] = thread;
  const modhash = submissionListing.data.modhash;

  return [
    parseSubmission(submissionListing.data.children[0].data, modhash),
    parseComments(commentListing.data.children, modhash),
  ];
};
