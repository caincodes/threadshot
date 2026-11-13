import type { XAuthor, XLinkCard, XMedia, XPost, XVerified } from "../types/x";

// X's syndication endpoint, the one its embedded posts load from. It needs no
// key; the token is derived from the id the same way X's embed script does.
const SYNDICATION_URL = "https://cdn.syndication.twimg.com/tweet-result";

export const X_POST_ID = /^\d{1,25}$/;

export class XApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const tokenFor = (id: string) =>
  ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");

type Indices = [number, number];

interface RawEntity {
  indices: Indices;
  text?: string;
  screen_name?: string;
  url?: string;
  display_url?: string;
}

interface RawUser {
  name: string;
  screen_name: string;
  profile_image_url_https?: string;
  profile_image_shape?: string;
  is_blue_verified?: boolean;
  verified?: boolean;
  verified_type?: string;
}

interface RawMedia {
  type: "photo" | "video" | "animated_gif";
  media_url_https: string;
  original_info?: { width: number; height: number };
  video_info?: {
    duration_millis?: number;
    variants?: { content_type: string; url: string; bitrate?: number }[];
  };
}

interface RawCard {
  url?: string;
  binding_values?: Record<
    string,
    { string_value?: string; image_value?: { url: string } }
  >;
}

interface RawPost {
  __typename?: string;
  id_str: string;
  created_at: string;
  text: string;
  display_text_range?: Indices;
  entities?: {
    hashtags?: RawEntity[];
    user_mentions?: RawEntity[];
    urls?: RawEntity[];
    symbols?: RawEntity[];
    media?: RawEntity[];
  };
  user: RawUser;
  favorite_count?: number;
  conversation_count?: number;
  reply_count?: number;
  retweet_count?: number;
  mediaDetails?: RawMedia[];
  card?: RawCard;
  quoted_tweet?: RawPost;
  parent?: RawPost;
  // Set on a long post, whose text X cuts short.
  note_tweet?: { id: string };
  in_reply_to_screen_name?: string;
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

// X sends text with &, < and > already escaped; undone so it is escaped once.
const unescapeHtml = (text: string) =>
  text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

// Indices count code points, so the text is split the same way. Links are
// plain anchors with no href: the image needs the colour, not the target, and
// a mention's href would keep a redacted handle in the page.
const postHtml = (post: RawPost, cardUrl?: string) => {
  const chars = Array.from(post.text);
  const [start, rangeEnd] = post.display_text_range ?? [0, chars.length];
  const { entities = {} } = post;
  // Attached media and a link shown as a card are drawn below, not as text.
  const firstMedia = entities.media?.[0]?.indices[0];
  let end = firstMedia !== undefined ? Math.min(rangeEnd, firstMedia) : rangeEnd;

  const links: Array<{ indices: Indices; text: string }> = [
    ...(entities.hashtags ?? []).map((tag) => ({
      indices: tag.indices,
      text: `#${tag.text}`,
    })),
    ...(entities.symbols ?? []).map((symbol) => ({
      indices: symbol.indices,
      text: `$${symbol.text}`,
    })),
    ...(entities.user_mentions ?? []).map((mention) => ({
      indices: mention.indices,
      text: `@${mention.screen_name}`,
    })),
    ...(entities.urls ?? []).flatMap((link) => {
      const isLast = chars.slice(link.indices[1], end).join("").trim() === "";
      if (cardUrl && link.url === cardUrl && isLast) {
        end = Math.min(end, link.indices[0]);
        return [];
      }
      return [{ indices: link.indices, text: link.display_url ?? link.url ?? "" }];
    }),
  ]
    .filter(({ indices: [from, to] }) => from >= start && to <= end)
    .sort((a, b) => a.indices[0] - b.indices[0]);

  let html = "";
  let at = start;
  for (const link of links) {
    if (link.indices[0] < at) {
      continue;
    }
    html += escapeHtml(unescapeHtml(chars.slice(at, link.indices[0]).join("")));
    html += `<a>${escapeHtml(link.text)}</a>`;
    at = link.indices[1];
  }
  html += escapeHtml(unescapeHtml(chars.slice(at, end).join("")));
  html = html.trim();
  if (post.note_tweet && html) {
    html += "…";
  }

  return html
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
};

const verifiedOf = (user: RawUser): XVerified => {
  if (user.verified_type === "Business") return "business";
  if (user.verified_type === "Government") return "government";
  return user.is_blue_verified || user.verified ? "blue" : null;
};

// The listed picture is 48px; the 400px one stays sharp in a 3x export.
const authorOf = (user: RawUser): XAuthor => ({
  name: user.name,
  handle: user.screen_name,
  avatar: user.profile_image_url_https?.replace(/_normal(\.\w+)$/, "_400x400$1"),
  isSquare: user.profile_image_shape === "Square",
  verified: verifiedOf(user),
});

// The browser downloads the whole MP4 to pick a frame from it, so it gets the
// sharpest one that stays around this size, in bits.
const MAX_VIDEO_BITS = 200_000_000;
const MAX_BITRATE = 2_500_000;

const videoOf = (item: RawMedia) => {
  const seconds = (item.video_info?.duration_millis ?? 0) / 1000;
  const limit = Math.min(MAX_BITRATE, MAX_VIDEO_BITS / Math.max(seconds, 1));
  const mp4s = (item.video_info?.variants ?? [])
    .filter((variant) => variant.content_type === "video/mp4")
    .sort((a, b) => (a.bitrate ?? 0) - (b.bitrate ?? 0));
  return (mp4s.findLast((variant) => (variant.bitrate ?? 0) <= limit) ?? mp4s[0])?.url;
};

const mediaOf = (media: RawMedia[] = []): XMedia[] =>
  media.map((item) => ({
    type:
      item.type === "animated_gif" ? "gif" : item.type === "video" ? "video" : "photo",
    url: item.media_url_https,
    width: item.original_info?.width ?? 16,
    height: item.original_info?.height ?? 9,
    video: item.type === "photo" ? undefined : videoOf(item),
  }));

const CARD_IMAGES = [
  "summary_photo_image_large",
  "photo_image_full_size_large",
  "thumbnail_image_large",
  "player_image_large",
];

const cardOf = (card?: RawCard): XLinkCard | undefined => {
  const values = card?.binding_values;
  const title = values?.title?.string_value;
  if (!values || !title) {
    return undefined;
  }
  return {
    title,
    domain: values.vanity_url?.string_value ?? values.domain?.string_value ?? "",
    image: CARD_IMAGES.map((key) => values[key]?.image_value?.url).find(Boolean),
  };
};

// A quote shows no quote of its own, and only the main post shows its parent.
type Level = "main" | "parent" | "quote";

const toPost = (raw: RawPost, level: Level = "main"): XPost => {
  const card = cardOf(raw.card);
  return {
    id: raw.id_str,
    author: authorOf(raw.user),
    createdUtc: Math.floor(Date.parse(raw.created_at) / 1000),
    html: postHtml(raw, card ? raw.card?.url : undefined),
    likes: raw.favorite_count ?? 0,
    replies: raw.conversation_count ?? raw.reply_count ?? 0,
    reposts: raw.retweet_count,
    media: mediaOf(raw.mediaDetails),
    card,
    replyingTo: raw.in_reply_to_screen_name,
    quoted:
      raw.quoted_tweet && level !== "quote" ? toPost(raw.quoted_tweet, "quote") : undefined,
    parent: raw.parent && level === "main" ? toPost(raw.parent, "parent") : undefined,
  };
};

const fetchRaw = async (id: string): Promise<RawPost> => {
  const url = new URL(SYNDICATION_URL);
  url.searchParams.set("id", id);
  url.searchParams.set("lang", "en");
  url.searchParams.set("token", tokenFor(id));

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (res.status === 404) {
    throw new XApiError(404, "X could not find that post.");
  }
  if (!res.ok) {
    throw new XApiError(502, `X returned ${res.status}.`);
  }
  const data = (await res.json().catch(() => null)) as RawPost | null;
  if (data?.__typename === "TweetTombstone") {
    throw new XApiError(404, "That post is not available. It may be deleted, private or age-restricted.");
  }
  if (!data?.id_str || !data.user) {
    throw new XApiError(404, "X could not find that post.");
  }
  return data;
};

// X sends the parent without the post it quotes, and a quote without the
// mark of a long post, so both are loaded on their own. If that fails, the
// version X sent is still good enough to show.
export const fetchXPost = async (id: string): Promise<XPost> => {
  const data = await fetchRaw(id);
  const reload = (post?: RawPost) =>
    post && fetchRaw(post.id_str).catch(() => post);
  [data.parent, data.quoted_tweet] = await Promise.all([
    reload(data.parent),
    reload(data.quoted_tweet),
  ]);
  return toPost(data);
};
