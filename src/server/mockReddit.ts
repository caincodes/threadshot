import type {
  ListedRawComment,
  ListedRawSubmission,
  Listing,
} from "../types/reddit";

// Sample Reddit payloads for local testing without API credentials (REDDIT_MOCK=1).
const NOW = Math.floor(Date.now() / 1000);

const base = (id: string, author: string, score: number, age: number) => ({
  author_flair_richtext: [],
  author_flair_background_color: "",
  author_flair_text_color: "dark",
  all_awardings: [],
  created_utc: NOW - age,
  created: NOW - age,
  id,
  name: id,
  subreddit: "woodworking",
  user_reports: [],
  saved: false,
  gilded: 0,
  hidden: false,
  upvote_ratio: 0.97,
  score,
  author,
  permalink: `/r/mocksub/comments/mock01/sample_post/${id}/`,
  spoiler: false,
  archived: false,
  stickied: false,
});

const comment = (
  id: string,
  author: string,
  html: string,
  score: number,
  depth: number,
  replies?: unknown[]
) => ({
  kind: "t1",
  data: {
    ...base(id, author, score, 3600 - depth * 600),
    parent_id: depth === 0 ? "t3_mock01" : "t1_parent",
    is_submitter: author === "plane_and_simple",
    body_html: html,
    depth,
    replies: replies
      ? {
          kind: "Listing",
          data: { modhash: "", children: replies },
        }
      : "",
  },
});

const html = (...paragraphs: string[]) =>
  `<div class="md">${paragraphs.map((text) => `<p>${text}</p>`).join("")}</div>`;

export const mockRedditResponse = (
  commentId?: string
): [Listing<ListedRawSubmission>, Listing<ListedRawComment>] =>
  [
  {
    kind: "Listing",
    data: {
      modhash: "",
      children: [
        {
          kind: "t3",
          data: {
            ...base("mock01", "plane_and_simple", 2431, 9 * 3600),
            subreddit_name_prefixed: "r/woodworking",
            num_comments: 187,
            title: "Finished my first dovetailed drawer after three failed attempts",
            domain: "self.woodworking",
            is_self: true,
            locked: false,
            // eslint-disable-next-line id-length -- reddit's richtext keys
            link_flair_richtext: [{ e: "text", t: "Project" }],
            link_flair_background_color: "#ffd635",
            link_flair_text_color: "dark",
            selftext_html: html(
              "Cherry sides, maple bottom, finished with a single coat of hardwax oil. The first two drawers had gaps you could post a letter through.",
              "Still not perfect, but it slides like it should. Next up: the other five drawers in the chest."
            ),
            is_original_content: true,
            clicked: false,
            thumbnail: "self",
            is_video: false,
            is_gallery: false,
            media_metadata: {},
          },
        },
      ],
    },
  },
  {
    kind: "Listing",
    data: {
      modhash: "",
      children: [
        comment(
          "mockc1",
          "chiselgoblin",
          html(
            "That gap on the left is the tell that you cut the tails first and traced them. Try pins first next time, and mark with a knife, not a pencil." +
              (commentId ? ` (permalink: ${commentId})` : "")
          ),
          1204,
          0,
          [
            comment(
              "mockc2",
              "plane_and_simple",
              html("Pencil was the whole problem. Marking knife arrives Thursday."),
              311,
              1,
              [
                comment(
                  "mockc3",
                  "thumbwheel_tom",
                  html(
                    "A cheap wheel gauge and a sharp chisel fixed it for me. Three drawers in and the gaps are gone."
                  ),
                  96,
                  2
                ),
              ]
            ),
          ]
        ),
        comment(
          "mockc4",
          "sawdust_and_coffee",
          html("The glue-up looks clean. Nobody sees the inside of a drawer."),
          642,
          0,
          [
            comment(
              "mockc5",
              "chiselgoblin",
              html("I do. Every single time I open one."),
              58,
              1
            ),
          ]
        ),
        comment(
          "mockc6",
          "borrowed_bandsaw",
          html("What is the finish? The cherry color is great."),
          215,
          0
        ),
      ],
    },
  },
] as unknown as [Listing<ListedRawSubmission>, Listing<ListedRawComment>];
