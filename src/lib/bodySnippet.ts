import { sanitizeHtml } from "./sanitizeHtml";

const BODY_SELECTOR = "#reddit-preview [data-post-body]";
const BLOCK_SELECTOR = "blockquote, h1, h2, h3, h4, h5, h6, hr, ol, p, pre, table, ul";

const hasText = (range: Range) => range.toString().trim() !== "";

// The part of a selection inside the post body, which it may run past.
const clampToBody = (selected: Range, body: Element) => {
  const whole = document.createRange();
  whole.selectNodeContents(body);
  const clamped = selected.cloneRange();
  if (clamped.compareBoundaryPoints(Range.START_TO_START, whole) < 0) {
    clamped.setStart(whole.startContainer, whole.startOffset);
  }
  if (clamped.compareBoundaryPoints(Range.END_TO_END, whole) > 0) {
    clamped.setEnd(whole.endContainer, whole.endOffset);
  }
  return clamped;
};

// Whether any text is left out on each side, so a cut is never hidden.
const cutSides = (range: Range, body: Element) => {
  const before = document.createRange();
  before.selectNodeContents(body);
  before.setEnd(range.startContainer, range.startOffset);
  const after = document.createRange();
  after.selectNodeContents(body);
  after.setStart(range.endContainer, range.endOffset);
  return { isCutBefore: hasText(before), isCutAfter: hasText(after) };
};

const textNodes = (root: Node) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (node.data.trim()) {
      nodes.push(node);
    }
  }
  return nodes;
};

// The selected part of the post body as HTML, marked with an ellipsis wherever
// text was left out. Null when no body text is selected.
export const snippetFromSelection = (selection: Selection | null) => {
  const body = document.querySelector(BODY_SELECTOR);
  if (!body || !selection?.rangeCount || selection.isCollapsed) {
    return null;
  }
  const selected = selection.getRangeAt(0);
  if (!selected.intersectsNode(body)) {
    return null;
  }
  const range = clampToBody(selected, body);
  if (!hasText(range)) {
    return null;
  }

  const { isCutBefore, isCutAfter } = cutSides(range, body);
  const snippet = document.createElement("div");
  snippet.append(range.cloneContents());
  const nodes = textNodes(snippet);
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  if (isCutBefore) {
    first.data = `…${first.data.trimStart()}`;
  }
  if (isCutAfter) {
    last.data = `${last.data.trimEnd().replace(/\.$/, "")}…`;
  }

  // A selection inside one paragraph comes back as bare text.
  const html = snippet.querySelector(BLOCK_SELECTOR)
    ? snippet.innerHTML
    : `<p>${snippet.innerHTML}</p>`;
  return sanitizeHtml(html);
};
