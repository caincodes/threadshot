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

export type RedditData = [
  RedditSubmission,
  Array<RedditComment | MoreChildren>,
];

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
