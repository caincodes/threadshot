import assert from "node:assert/strict";
import { test } from "node:test";

import { editorTargetFor, editorTargetInText } from "../src/lib/links.ts";

const path = (link: string, ownHost?: string) =>
  editorTargetFor(new URL(link), ownHost)?.path ?? null;

test("X post links on every X host", () => {
  for (const link of [
    "https://x.com/jack/status/20",
    "https://twitter.com/jack/status/20?s=46&t=abc",
    "https://mobile.twitter.com/jack/status/20/photo/1",
    "https://x.com/i/status/20",
    "https://twitter.com/i/web/status/20",
    "https://fxtwitter.com/jack/statuses/20",
  ]) {
    assert.equal(path(link), "/generate?x=20", link);
  }
});

test("X links with the host swapped for this site", () => {
  assert.equal(path("https://threadshot.app/jack/status/20"), "/generate?x=20");
  assert.equal(path("https://dev.threadshot.app/jack/status/20"), "/generate?x=20");
  assert.equal(path("http://localhost:4321/jack/status/20", "localhost:4321"), "/generate?x=20");
  assert.equal(path("https://example.com/jack/status/20"), null);
});

test("Reddit post and share links", () => {
  assert.equal(
    path("https://www.reddit.com/r/woodworking/comments/abc/title/def/"),
    "/generate?sub=woodworking&postId=abc&commentId=def"
  );
  assert.equal(
    path("https://www.reddit.com/r/woodworking/s/Xy12"),
    "/generate?sub=woodworking&share=Xy12"
  );
});

test("other links are not posts", () => {
  assert.equal(path("https://x.com/home"), null);
  assert.equal(path("https://x.com/jack"), null);
  assert.equal(path("https://www.reddit.com/r/woodworking/"), null);
});

test("finds the post link in shared text, ignoring trailing punctuation", () => {
  assert.equal(
    editorTargetInText("Look at this: https://x.com/jack/status/20.")?.path,
    "/generate?x=20"
  );
  assert.equal(
    editorTargetInText("(https://x.com/jack/status/20)")?.path,
    "/generate?x=20"
  );
  assert.equal(
    editorTargetInText("https://example.com then https://x.com/a/status/7")?.path,
    "/generate?x=7"
  );
  assert.equal(editorTargetInText("no links here"), null);
});
