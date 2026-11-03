import assert from "node:assert/strict";
import { test } from "node:test";

import { createRateLimit } from "../src/server/rateLimit.ts";

test("allows the limit, then asks to wait until the window ends", () => {
  const isLimited = createRateLimit({ limit: 2, windowMs: 60_000 });
  assert.equal(isLimited("a", 0), 0);
  assert.equal(isLimited("a", 1000), 0);
  assert.equal(isLimited("a", 2000), 58);
  assert.equal(isLimited("b", 2000), 0);
  assert.equal(isLimited("a", 60_000), 0);
});
