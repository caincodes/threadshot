import type {
  ListedRawComment,
  ListedRawSubmission,
  Listing,
} from "../types/reddit";

// A bundled sample thread, shown by the "Try a sample post" link. It has the
// same shape as reddit's API response so it goes through the normal parsers.
//
// The shape is chosen so every editor option visibly does something when you
// move it away from its default:
//  - 10 top-level comments (default shows 2)
//  - a reply chain 6 levels deep (default depth is 3)
//  - comments with up to 8 direct replies (default shows 1 per comment)
//  - scores, ages and controversy that make each sort order different
// Fixture order is the "best" order; other sorts are applied in redditData.ts.
const NOW = Math.floor(Date.now() / 1000);

interface Spec {
  author: string;
  text: string;
  score: number;
  /** Seconds before now. */
  age: number;
  controversial?: boolean;
  replies?: Spec[];
}

const OP = "plane_and_simple";

const thread: Spec[] = [
  {
    author: "chiselgoblin",
    text: "That gap on the left is the tell that you cut the tails first and traced them. Try pins first next time, and mark with a knife, not a pencil.",
    score: 1204,
    age: 3600,
    replies: [
      {
        author: OP,
        text: "Pencil was the whole problem. Marking knife arrives Thursday.",
        score: 311,
        age: 3050,
        replies: [
          {
            author: "thumbwheel_tom",
            text: "A cheap wheel gauge and a sharp chisel fixed it for me. Three drawers in and the gaps are gone.",
            score: 96,
            age: 2450,
            replies: [
              {
                author: OP,
                text: "Ordering a wheel gauge tonight, then.",
                score: 41,
                age: 2300,
                replies: [
                  {
                    author: "chiselgoblin",
                    text: "Get one with a hardened wheel. The cheap ones dull in a week.",
                    score: 28,
                    age: 2100,
                    replies: [
                      {
                        author: "thumbwheel_tom",
                        text: "Seconded. Mine has lasted two years of daily use.",
                        score: 19,
                        age: 1900,
                        replies: [
                          {
                            author: OP,
                            text: "Good to know. Budget is about thirty dollars.",
                            score: 12,
                            age: 1700,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        author: "lathe_lurker",
        text: "Also check that the back of your chisel is actually flat. Half my early gaps were a dull, rounded edge.",
        score: 188,
        age: 3300,
        controversial: true,
      },
      {
        author: "coping_saw_carl",
        text: "A coping saw and a sharp chisel are all you need. Skip the jig.",
        score: 402,
        age: 2000,
      },
    ],
  },
  {
    author: "sawdust_and_coffee",
    text: "The glue-up looks clean. Nobody sees the inside of a drawer.",
    score: 642,
    age: 3500,
    replies: [
      {
        author: "chiselgoblin",
        text: "I do. Every single time I open one.",
        score: 58,
        age: 2900,
      },
    ],
  },
  {
    author: "borrowed_bandsaw",
    text: "What is the finish? The cherry color is great.",
    score: 215,
    age: 3300,
    replies: [
      {
        author: OP,
        text: "Hardwax oil, one coat. Cherry darkens on its own over the first year.",
        score: 74,
        age: 3000,
      },
    ],
  },
  {
    author: "veneer_of_doubt",
    text: "Serious question: is a dovetailed drawer worth it over a pocket screw box? Genuinely asking.",
    score: 388,
    age: 7200,
    replies: [
      {
        author: "hand_plane_hank",
        text: "Worth it if you like the process. Not worth it if you just want drawers.",
        score: 142,
        age: 6500,
      },
      {
        author: "kerf_and_effect",
        text: "Pocket screws will outlive both of us. Dovetails look better in photos.",
        score: 96,
        age: 6300,
      },
      {
        author: "shop_vac_sam",
        text: "Depends who opens the drawer. Guests never will.",
        score: 61,
        age: 6000,
      },
      {
        author: "half_blind_harriet",
        text: "Half-blind for the front, through dovetails for the back. Best of both.",
        score: 54,
        age: 5700,
      },
      {
        author: "box_joint_bob",
        text: "Box joints. Faster and still honest joinery.",
        score: 38,
        age: 5400,
        controversial: true,
      },
      {
        author: "slow_and_steady",
        text: "I tried both and kept cutting dovetails because it is relaxing.",
        score: 33,
        age: 5100,
      },
      {
        author: "nailed_it_nana",
        text: "My grandfather's drawers were nailed. Still working after sixty years.",
        score: 27,
        age: 4800,
      },
      {
        author: "ten_woodworkers",
        text: "Ask ten woodworkers, get fourteen answers.",
        score: 19,
        age: 4500,
      },
    ],
  },
  {
    author: "dovetail_dan",
    text: "Hot take: a router jig and a good bit make dovetails nobody can tell from hand cut.",
    score: 97,
    age: 2400,
    controversial: true,
    replies: [
      {
        author: "chiselgoblin",
        text: "People can tell.",
        score: 66,
        age: 2200,
        controversial: true,
      },
      {
        author: "jig_enjoyer",
        text: "Spoken like someone who never fixed a jig that drifted by a hair.",
        score: 51,
        age: 2000,
      },
    ],
  },
  {
    author: "grain_and_gripe",
    text: "The drawer slides smoothly because the sides are quartersawn. Good choice.",
    score: 530,
    age: 5400,
    replies: [
      {
        author: OP,
        text: "Lucky accident. It was the only cherry the yard had that day.",
        score: 45,
        age: 5000,
      },
    ],
  },
  {
    author: "offcut_collector",
    text: "Where did you learn? Any videos you would recommend?",
    score: 73,
    age: 1800,
    replies: [
      {
        author: OP,
        text: "Search for hand-cut dovetails from any decent channel, then cut ten practice joints before touching real stock.",
        score: 38,
        age: 1500,
      },
    ],
  },
  {
    author: "hand_plane_hank",
    text: "Congrats! My first set looked like a bear chewed them. Keep going.",
    score: 301,
    age: 9000,
  },
  {
    author: "jointer_jess",
    text: "Honestly the gaps add character.",
    score: 46,
    age: 1200,
    controversial: true,
    replies: [
      {
        author: "sawdust_and_coffee",
        text: "No, they do not.",
        score: 31,
        age: 900,
        controversial: true,
      },
    ],
  },
  {
    author: "clamp_goblin",
    text: "Cherry and maple is a great pairing.",
    score: 22,
    age: 600,
  },
];

const html = (...paragraphs: string[]) =>
  `<div class="md">${paragraphs.map((text) => `<p>${text}</p>`).join("")}</div>`;

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
  permalink: `/r/woodworking/comments/sample01/sample_post/${id}/`,
  spoiler: false,
  archived: false,
  stickied: false,
});

let nextId = 0;

const toComment = (spec: Spec, depth: number): unknown => ({
  kind: "t1",
  data: {
    ...base(`samplec${++nextId}`, spec.author, spec.score, spec.age),
    parent_id: depth === 0 ? "t3_sample01" : "t1_parent",
    is_submitter: spec.author === OP,
    controversiality: spec.controversial ? 1 : 0,
    body_html: html(spec.text),
    depth,
    replies: spec.replies
      ? {
          kind: "Listing",
          data: {
            modhash: "",
            children: spec.replies.map((reply) => toComment(reply, depth + 1)),
          },
        }
      : "",
  },
});

export const sampleRedditResponse = (): [
  Listing<ListedRawSubmission>,
  Listing<ListedRawComment>,
] => {
  nextId = 0;
  return [
    {
      kind: "Listing",
      data: {
        modhash: "",
        children: [
          {
            kind: "t3",
            data: {
              ...base("sample01", OP, 2431, 9 * 3600),
              subreddit_name_prefixed: "r/woodworking",
              num_comments: 187,
              title:
                "Finished my first dovetailed drawer after three failed attempts",
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
        children: thread.map((spec) => toComment(spec, 0)),
      },
    },
  ] as unknown as [Listing<ListedRawSubmission>, Listing<ListedRawComment>];
};
