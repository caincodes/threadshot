// Builds public/og.png (1200x630), the social preview image, from the real
// renderer's sample Reddit thread and X post.
//
//   npm run dev          (in another terminal)
//   node scripts/og-image/build.mjs
//
// Needs Playwright with Chromium installed; it is not a project dependency.
import { createRequire } from "node:module";
import { rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const { chromium } = createRequire(import.meta.url)("playwright");
const here = dirname(fileURLToPath(import.meta.url));
const origin = process.env.ORIGIN ?? "http://localhost:4321";
const out = join(here, "..", "..", "public", "og.png");
const sample = join(here, "sample.png");
const sampleX = join(here, "sample-x.png");

const browser = await chromium.launch();

const shot = await browser.newPage({ viewport: { width: 1200, height: 1000 }, deviceScaleFactor: 2 });
await shot.goto(`${origin}/generate?sample=1`, { waitUntil: "domcontentloaded" });
await shot.waitForSelector("#reddit-preview");
await shot.getByText("Advanced", { exact: true }).click();
await shot.getByText("Subreddit icon").click();
await shot.getByText("Profile pictures").click();
await shot.waitForTimeout(600);
await shot.locator("#reddit-preview").screenshot({ path: sample });

await shot.goto(`${origin}/generate?sample=x`, { waitUntil: "domcontentloaded" });
await shot.waitForSelector("#reddit-preview");
await shot.waitForTimeout(600);
await shot.locator("#reddit-preview").screenshot({ path: sampleX });

const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(`file://${join(here, "og.html")}`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out });

await browser.close();
rmSync(sample);
rmSync(sampleX);
console.log(`wrote ${out}`);
