import type { XAuthor, XLinkCard, XMedia, XPost, XVerified } from "../types/x";

// X's syndication endpoint, the one its embedded posts load from. It needs no
// key; the token is derived from the id the same way X's embed script does.
const SYNDICATION_URL = "https://cdn.syndication.twimg.com/tweet-result";

export const X_POST_ID = /^\d{1,25}$/;

export class XApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
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
      if (cardUrl && link.url === cardUrl && link.indices[1] >= end) {
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

  return html
    .trim()
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

const mediaOf = (media: RawMedia[] = []): XMedia[] =>
  media.map((item) => ({
    type:
      item.type === "animated_gif" ? "gif" : item.type === "video" ? "video" : "photo",
    url: item.media_url_https,
    width: item.original_info?.width ?? 16,
    height: item.original_info?.height ?? 9,
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

const toPost = (raw: RawPost, depth = 0): XPost => {
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
    quoted: raw.quoted_tweet && depth < 1 ? toPost(raw.quoted_tweet, depth + 1) : undefined,
    parent: raw.parent && depth < 1 ? toPost(raw.parent, depth + 1) : undefined,
  };
};

export const fetchXPost = async (id: string): Promise<XPost> => {
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
  return toPost(data);
};
