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

export const fetchRedditData = async (
  subreddit: string,
  postId: string,
  commentId: string | null,
  sort: CommentSort,
  signal?: AbortSignal
): Promise<RedditData> => {
  const params = new URLSearchParams({ sub: subreddit, postId, sort });
  if (commentId) {
    params.set("commentId", commentId);
  }

  const res = await fetch(`/api/reddit?${params}`, { signal });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }

  const [submissionListing, commentListing] = (await res.json()) as [
    Listing<ListedRawSubmission>,
    Listing<ListedRawComment>,
  ];
  const modhash = submissionListing.data.modhash;

  return [
    parseSubmission(submissionListing.data.children[0].data, modhash),
    parseComments(commentListing.data.children, modhash),
  ];
};
