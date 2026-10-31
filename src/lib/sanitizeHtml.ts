import DOMPurify from "dompurify";

// Comment and post HTML is rendered with {@html}, and a thread can arrive in a
// link that anyone could craft, so only what reddit's markdown produces is kept.
// Classes go too: this site's own utility classes could dress up fake page UI.
const ALLOWED_TAGS = [
  "a",
  "blockquote",
  "br",
  "code",
  "del",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "li",
  "ol",
  "p",
  "pre",
  "span",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "ul",
];

// Needs a DOM, so this only runs in the browser.
export const sanitizeHtml = (html: string): string =>
  DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: ["href", "title"] });
