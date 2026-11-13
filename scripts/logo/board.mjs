// Renders PNG exports of the logo kit and a board of the logo in use, into
// design/logo. Run scripts/logo/build.mjs first.
//
//   node scripts/logo/board.mjs
//
// Needs Playwright with Chromium installed; it is not a project dependency.
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const { chromium } = createRequire(import.meta.url)("playwright");
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const logo = join(root, "design", "logo");
const svgDir = join(logo, "svg");
const pngDir = join(logo, "png");
mkdirSync(pngDir, { recursive: true });

const file = (name) => readFileSync(join(svgDir, name), "utf8");
const uri = (name) => `data:image/svg+xml;base64,${Buffer.from(file(name)).toString("base64")}`;
const font = (path) => readFileSync(join(root, "node_modules", path)).toString("base64");
const fonts = `@font-face{font-family:Archivo;font-weight:100 900;src:url(data:font/woff2;base64,${font("@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2")})}
@font-face{font-family:Plex;font-weight:500;src:url(data:font/woff2;base64,${font("@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff2")})}
@font-face{font-family:Inter;font-weight:100 900;src:url(data:font/woff2;base64,${font("@fontsource-variable/inter/files/inter-latin-wght-normal.woff2")})}`;

const browser = await chromium.launch();
const page = await browser.newPage();

// Every SVG in the kit, 1024px tall (512 for icons), on a transparent background.
for (const name of readdirSync(svgDir).filter((entry) => entry.endsWith(".svg"))) {
  const [, , width, height] = file(name).match(/viewBox="([^"]+)"/)[1].split(" ").map(Number);
  const tall = name.includes("icon") || name.includes("favicon") ? 512 : 1024;
  const w = Math.round((width / height) * tall);
  await page.setViewportSize({ width: w, height: tall });
  await page.setContent(`<style>html,body{margin:0;background:transparent}</style><img src="${uri(name)}" width="${w}" height="${tall}" style="display:block">`);
  await page.screenshot({ path: join(pngDir, name.replace(".svg", ".png")), omitBackground: true });
}

const og = readFileSync(join(root, "public", "og.png")).toString("base64");
const grey = (color) => `<span class="app" style="background:${color}"></span>`;
const board = `<style>${fonts}
*{box-sizing:border-box;margin:0}
body{width:1440px;padding:56px;background:#fff;color:#0f1419;font:500 16px/1.4 Plex,sans-serif}
h1{font:800 40px/1 Archivo;letter-spacing:-.02em}
.sub{margin:10px 0 36px;color:#3a444d;font-size:18px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
figure{border:1px solid #d3d9df;border-radius:6px;overflow:hidden}
.scene{height:300px;display:flex;align-items:center;justify-content:center;position:relative}
figcaption{padding:12px 16px;border-top:1px solid #d3d9df;color:#3a444d;font-size:14px}
.phone{background:linear-gradient(160deg,#2b3540,#11161b)}
.home{display:grid;grid-template-columns:repeat(4,64px);gap:22px 26px}
.home div{display:flex;flex-direction:column;align-items:center;gap:6px;color:#fff;font:500 12px Inter}
.app{display:block;width:64px;height:64px;border-radius:15px}
.tabs{background:#dfe3e7;flex-direction:column;gap:28px}
.tab{display:flex;align-items:center;gap:10px;width:300px;padding:10px 14px;border-radius:10px 10px 0 0;font:500 14px Inter}
.tab img{width:16px;height:16px}
.card{background:#e9edf0}
.share{width:330px;background:#fff;border-radius:14px;padding:18px;font:400 15px/1.4 Inter;box-shadow:0 1px 2px #0001}
.share b{font-weight:700}.share p{margin:8px 0 14px;color:#0f1419}
.wm{display:flex;justify-content:flex-end;align-items:center;gap:4px;opacity:.35;font:800 13px Archivo;letter-spacing:-.02em}
.wm img{width:15px;height:15px}
.site{background:#fff;flex-direction:column;align-items:stretch;justify-content:flex-start}
.bar{display:flex;align-items:center;gap:10px;height:56px;padding:0 20px;border-bottom:1px solid #d3d9df;font:800 20px Archivo;letter-spacing:-.02em}
.bar img{width:28px}.bar span{margin-left:auto;font:600 14px Plex}
.hero{padding:28px 20px;font:800 34px/1.05 Archivo;letter-spacing:-.02em}.hero em{font-style:normal;color:#bf3b0f}
.btn{display:inline-flex;gap:10px;align-items:center;margin:0 20px;background:#bf3b0f;color:#fff;border-radius:6px;padding:12px 18px;font:600 16px Plex;width:max-content}
.dark{background:#0f1419}
.social{background:#f4f6f8}
.post{width:340px;border:1px solid #d3d9df;border-radius:14px;overflow:hidden;background:#fff;font:400 13px Inter}
.post img{display:block;width:100%}.post div{padding:10px 12px;color:#536471}
</style>
<h1>threadshot — logo in use</h1>
<p class="sub">Direction C4: viewfinder corners that close into a speech bubble. Ink and vermilion, set with Archivo ExtraBold.</p>
<div class="grid">
<figure><div class="scene phone"><div class="home">
  ${[["#3b82f6","Mail"],["#22c55e","Messages"],["#f59e0b","Notes"],["#64748b","Settings"],["#a855f7","Podcasts"]].map(([c,l]) => `<div>${grey(c)}${l}</div>`).join("")}
  <div><img class="app" src="${uri("threadshot-app-icon.svg")}">threadshot</div>
  ${[["#ef4444","Calendar"],["#0ea5e9","Weather"]].map(([c,l]) => `<div>${grey(c)}${l}</div>`).join("")}
</div></div><figcaption>App icon on a home screen</figcaption></figure>
<figure><div class="scene tabs">
  <div class="tab" style="background:#fff"><img src="${uri("threadshot-favicon.svg")}">threadshot.app</div>
  <div class="tab" style="background:#202124;color:#e8eaed"><img src="${uri("threadshot-favicon.svg")}">threadshot.app</div>
</div><figcaption>Favicon in light and dark browser tabs</figcaption></figure>
<figure><div class="scene card"><div class="share">
  <b>Finished my first dovetailed drawer</b><p>Cherry sides, maple bottom, and a single coat of hardwax oil.</p>
  <div class="wm"><img src="${uri("threadshot-symbol-small-black.svg")}">threadshot.app</div>
</div></div><figcaption>Watermark on an exported image</figcaption></figure>
<figure><div class="scene site">
  <div class="bar"><img src="${uri("threadshot-symbol-small-color.svg")}">threadshot.app<span>Feedback</span></div>
  <div class="hero">Turn any post into a <em>clean image</em></div>
  <div class="btn">Share image</div>
</div><figcaption>Site header</figcaption></figure>
<figure><div class="scene dark"><img src="${uri("threadshot-horizontal-reversed.svg")}" height="72"></div><figcaption>Reversed lockup on ink</figcaption></figure>
<figure><div class="scene social"><div class="post"><img src="data:image/png;base64,${og}"><div>threadshot.app<br><b style="color:#0f1419">threadshot.app — Reddit and X, as clean images</b></div></div></div><figcaption>Link preview</figcaption></figure>
</div>`;
await page.setViewportSize({ width: 1440, height: 900 });
await page.setContent(board);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: join(logo, "board.png"), fullPage: true });
await browser.close();
console.log("pngs and board written");
