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
  subreddit: "mocksub",
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
    is_submitter: author === "mock_op",
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

export const mockRedditResponse = (commentId?: string) => [
  {
    kind: "Listing",
    data: {
      modhash: "",
      children: [
        {
          kind: "t3",
          data: {
            ...base("mock01", "mock_op", 1234, 7200),
            subreddit_name_prefixed: "r/mocksub",
            title: "Sample post for testing post-share-web",
            domain: "self.mocksub",
            is_self: true,
            locked: false,
            selftext_html:
              "<div class=\"md\"><p>This is mock data. Set REDDIT_MOCK=0 and add credentials to see real posts.</p></div>",
            is_original_content: false,
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
          "mock_user_one",
          "<div class=\"md\"><p>Top-level comment" +
            (commentId ? ` (requested ${commentId})` : "") +
            ".</p></div>",
          482,
          0,
          [
            comment(
              "mockc2",
              "mock_op",
              "<div class=\"md\"><p>A reply from the original poster.</p></div>",
              97,
              1,
              [
                comment(
                  "mockc3",
                  "mock_user_two",
                  "<div class=\"md\"><p>A nested reply, to check indentation.</p></div>",
                  12,
                  2
                ),
              ]
            ),
          ]
        ),
        comment(
          "mockc4",
          "mock_user_three",
          "<div class=\"md\"><p>Another top-level comment.</p></div>",
          35,
          0
        ),
      ],
    },
  },
];
