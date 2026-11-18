import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { fetchXPost, fetchXReplies, XApiError } from "../src/server/x.ts";

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

const respondWith = (body: unknown, status = 200) => {
  globalThis.fetch = async () => Response.json(body, { status });
};

const user = {
  name: "Ines",
  screen_name: "ines",
  profile_image_url_https: "https://pbs.twimg.com/profile_images/1/a_normal.jpg",
  is_blue_verified: true,
};

// X sends text HTML-escaped and counts entity positions in code points of
// that escaped text, so positions are worked out the same way here.
const span = (text: string, part: string, from = 0): [number, number] => {
  const chars = Array.from(text);
  for (let start = from; start < chars.length; start += 1) {
    if (chars.slice(start, start + Array.from(part).length).join("") === part) {
      return [start, start + Array.from(part).length];
    }
  }
  throw new Error(`${part} not in ${text}`);
};

test("builds escaped HTML with entities, media and card links removed", async () => {
  const text = "@bob Hi &lt;b&gt; #tag &amp; see https://t.co/card\n\nhttps://t.co/pic";
  respondWith({
    __typename: "Tweet",
    id_str: "1",
    created_at: "2023-07-25T19:23:35.000Z",
    text,
    display_text_range: [5, Array.from(text).length],
    entities: {
      hashtags: [{ indices: span(text, "#tag"), text: "tag" }],
      user_mentions: [{ indices: span(text, "@bob"), screen_name: "bob" }],
      urls: [{ indices: span(text, "https://t.co/card"), url: "https://t.co/card", display_url: "example.com" }],
      media: [{ indices: span(text, "https://t.co/pic"), url: "https://t.co/pic" }],
    },
    user,
    favorite_count: 5,
    conversation_count: 2,
    card: {
      url: "https://t.co/card",
      binding_values: {
        title: { string_value: "A card" },
        domain: { string_value: "example.com" },
      },
    },
    mediaDetails: [
      {
        type: "photo",
        media_url_https: "https://pbs.twimg.com/media/a.jpg",
        original_info: { width: 800, height: 600 },
      },
    ],
  });
  const post = await fetchXPost("1");
  assert.equal(post.html, "<p>Hi &lt;b&gt; <a>#tag</a> &amp; see</p>");
  assert.equal(post.author.avatar, "https://pbs.twimg.com/profile_images/1/a_400x400.jpg");
  assert.equal(post.author.verified, "blue");
  assert.deepEqual(post.card, { title: "A card", domain: "example.com", image: undefined });
  assert.equal(post.media[0].type, "photo");
  assert.equal(post.createdUtc, 1690313015);
});

test("keeps emoji intact, since positions count code points", async () => {
  const text = "😀 hi @ann";
  respondWith({
    id_str: "2",
    created_at: "2023-01-01T00:00:00.000Z",
    text,
    display_text_range: [0, Array.from(text).length],
    entities: { user_mentions: [{ indices: span(text, "@ann"), screen_name: "ann" }] },
    user,
  });
  assert.equal((await fetchXPost("2")).html, "<p>😀 hi <a>@ann</a></p>");
});

test("reports deleted and missing posts", async () => {
  respondWith({ __typename: "TweetTombstone" });
  await assert.rejects(fetchXPost("3"), (error: unknown) => error instanceof XApiError && error.status === 404);
  respondWith({}, 404);
  await assert.rejects(fetchXPost("4"), (error: unknown) => error instanceof XApiError && error.status === 404);
});

test("loads the parent on its own to get the post it quotes", async () => {
  const raw = (id: string, extra = {}) => ({
    id_str: id,
    created_at: "2023-01-01T00:00:00.000Z",
    text: `post ${id}`,
    user,
    ...extra,
  });
  const posts: Record<string, unknown> = {
    "10": raw("10", { parent: raw("11") }),
    "11": raw("11", { quoted_tweet: raw("12") }),
  };
  globalThis.fetch = async (input) => {
    const id = new URL(String(input)).searchParams.get("id") ?? "";
    return Response.json(posts[id] ?? {}, { status: posts[id] ? 200 : 404 });
  };
  const post = await fetchXPost("10");
  assert.equal(post.parent?.quoted?.html, "<p>post 12</p>");

  delete posts["11"];
  const fallback = await fetchXPost("10");
  assert.equal(fallback.parent?.html, "<p>post 11</p>");
  assert.equal(fallback.parent?.quoted, undefined);
});

test("ends a long quote, loaded on its own, with an ellipsis", async () => {
  const raw = (id: string, extra = {}) => ({
    id_str: id,
    created_at: "2023-01-01T00:00:00.000Z",
    text: `post ${id} `,
    user,
    ...extra,
  });
  const posts: Record<string, unknown> = {
    "20": raw("20", { quoted_tweet: raw("21") }),
    "21": raw("21", { note_tweet: { id: "1" } }),
  };
  globalThis.fetch = async (input) => {
    const id = new URL(String(input)).searchParams.get("id") ?? "";
    return Response.json(posts[id] ?? {}, { status: posts[id] ? 200 : 404 });
  };
  assert.equal((await fetchXPost("20")).quoted?.html, "<p>post 21…</p>");
});

test("adds a long post's whole text from FxTwitter, keeping the short one", async () => {
  const full = "Long 😀 #tag and @ann then https://t.co/x\n\nEnd";
  const at = (part: string) => span(full, part);
  let isFxUp = true;
  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    if (url.hostname === "api.fxtwitter.com") {
      if (!isFxUp) return Response.json({}, { status: 500 });
      return Response.json({
        tweet: {
          raw_text: {
            text: full,
            display_text_range: [0, Array.from(full).length],
            facets: [
              { type: "hashtag", indices: at("#tag"), original: "tag" },
              { type: "mention", indices: at("@ann"), original: "ann" },
              { type: "url", indices: at("https://t.co/x"), original: "https://t.co/x", display: "example.com" },
              { type: "media", indices: [0, 4], original: "https://t.co/pic" },
            ],
          },
        },
      });
    }
    return Response.json({
      id_str: "30",
      created_at: "2023-01-01T00:00:00.000Z",
      text: "Long 😀",
      note_tweet: { id: "n" },
      user,
    });
  };
  const post = await fetchXPost("30");
  assert.equal(post.html, "<p>Long 😀…</p>");
  assert.equal(
    post.fullHtml,
    "<p>Long 😀 <a>#tag</a> and <a>@ann</a> then <a>example.com</a></p><p>End</p>"
  );

  isFxUp = false;
  const fallback = await fetchXPost("30");
  assert.equal(fallback.html, "<p>Long 😀…</p>");
  assert.equal(fallback.fullHtml, undefined);
});

test("turns FxTwitter's replies into posts, without their leading mentions", async () => {
  const text = "@op Agreed #yes";
  globalThis.fetch = async (input) => {
    assert.equal(String(input), "https://api.fxtwitter.com/2/conversation/40");
    return Response.json({
      replies: [
        {
          id: "41",
          created_timestamp: 1690313015,
          raw_text: {
            text,
            display_text_range: [4, Array.from(text).length],
            facets: [
              { type: "mention", indices: span(text, "@op"), original: "op" },
              { type: "hashtag", indices: span(text, "#yes"), original: "yes" },
            ],
          },
          author: {
            name: "Ann",
            screen_name: "ann",
            avatar_url: "https://pbs.twimg.com/profile_images/1/a_200x200.jpg",
            verification: { verified: true, type: "business" },
          },
          likes: 9,
          replies: 1,
          media: {
            all: [
              { type: "photo", url: "https://pbs.twimg.com/media/p.jpg?name=orig", width: 4, height: 3 },
              { type: "gif", thumbnail_url: "https://pbs.twimg.com/tweet_video_thumb/g.jpg", width: 2, height: 2 },
            ],
          },
        },
        { id: "42" },
      ],
    });
  };
  const replies = await fetchXReplies("40");
  assert.equal(replies.length, 1);
  const [reply] = replies;
  assert.equal(reply.html, "<p>Agreed <a>#yes</a></p>");
  assert.equal(reply.author.avatar, "https://pbs.twimg.com/profile_images/1/a_400x400.jpg");
  assert.equal(reply.author.verified, "business");
  assert.equal(reply.createdUtc, 1690313015);
  assert.deepEqual(
    reply.media.map(({ type, url }) => [type, url]),
    [
      ["photo", "https://pbs.twimg.com/media/p.jpg"],
      ["gif", "https://pbs.twimg.com/tweet_video_thumb/g.jpg"],
    ]
  );
});
