// @astrojs/vercel still only lists Node 20/22/24 in SUPPORTED_NODE_VERSIONS, so
// a Node 26 build emits runtime "nodejs24.x" and warns. Vercel has supported
// Node 26 since 2026-10-29; rewrite function configs to match engines.node
// until the adapter catches up. Remove this once @astrojs/vercel includes 26.

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const functionsDir = join(root, ".vercel/output/functions");

const enginesNode = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))
  .engines?.node;
const major = /^(\d+)/.exec(enginesNode ?? "")?.[1] ?? process.versions.node.split(".")[0];
const runtime = `nodejs${major}.x`;

let updated = 0;
for (const name of readdirSync(functionsDir, { withFileTypes: true })) {
  if (!name.isDirectory() || !name.name.endsWith(".func")) continue;
  const configPath = join(functionsDir, name.name, ".vc-config.json");
  let config;
  try {
    config = JSON.parse(readFileSync(configPath, "utf8"));
  } catch {
    continue;
  }
  if (typeof config.runtime !== "string" || !config.runtime.startsWith("nodejs")) {
    continue;
  }
  if (config.runtime === runtime) continue;
  config.runtime = runtime;
  writeFileSync(configPath, `${JSON.stringify(config, null, "\t")}\n`);
  updated += 1;
}

if (updated) {
  console.log(`Set ${updated} Vercel function runtime(s) to ${runtime}`);
}
