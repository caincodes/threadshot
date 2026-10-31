// The site's version, counted from conventional commits so nobody sets it by
// hand. caincodes' first commit is v2.0.0, and each later commit bumps it:
//   breaking change        major
//   feat, fix              minor
//   anything else          patch
// As in semver, a bump resets the numbers to its right. Merges don't count.
//
// Run `node scripts/version.mjs` to print the current version.

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const FIRST_COMMIT = "029c11a0ae618fb86002d647fa3f03392bb20bd3";
const FIRST_VERSION = [2, 0, 0];

const git = (cwd, ...args) =>
  execFileSync("git", args, { cwd, encoding: "utf8", stdio: "pipe" });

const CONVENTIONAL = /^(\w+)(?:\([^)]*\))?(!)?:/;

const bump = ([major, minor, patch], message) => {
  const [, type, bang] = CONVENTIONAL.exec(message) ?? [];
  if (bang || /^BREAKING[ -]CHANGE:/m.test(message)) {
    return [major + 1, 0, 0];
  }
  return type === "feat" || type === "fix"
    ? [major, minor + 1, 0]
    : [major, minor, patch + 1];
};

const commitMessages = (cwd, commit) =>
  git(
    cwd,
    "log",
    "--reverse",
    "--topo-order",
    "--no-merges",
    "--format=%B%x00",
    `${FIRST_COMMIT}..${commit}`
  )
    .split("\0")
    .map((message) => message.trim())
    .filter(Boolean);

const countFrom = (cwd, commit) =>
  commitMessages(cwd, commit).reduce(bump, FIRST_VERSION).join(".");

// Vercel's checkout can be shallow or have no .git at all, so a partial history
// would undercount. Commits alone are enough here, which keeps this clone small.
const countFromClone = (commit) => {
  const owner = process.env.VERCEL_GIT_REPO_OWNER ?? "caincodes";
  const slug = process.env.VERCEL_GIT_REPO_SLUG ?? "threadshot";
  const dir = mkdtempSync(join(tmpdir(), "threadshot-history-"));
  try {
    git(
      dir,
      "clone",
      "--quiet",
      "--bare",
      "--filter=tree:0",
      `https://github.com/${owner}/${slug}.git`,
      "."
    );
    return countFrom(dir, commit);
  } finally {
    rmSync(dir, { force: true, recursive: true });
  }
};

const hasFullHistory = (cwd) => {
  try {
    return (
      git(cwd, "rev-parse", "--is-shallow-repository").trim() === "false" &&
      git(cwd, "cat-file", "-t", FIRST_COMMIT).trim() === "commit"
    );
  } catch {
    return false;
  }
};

export const versionAt = (commit, cwd = process.cwd()) => {
  if (!commit) {
    return null;
  }
  try {
    return hasFullHistory(cwd) ? countFrom(cwd, commit) : countFromClone(commit);
  } catch (error) {
    console.warn(`Could not count the version: ${error.message}`);
    return null;
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(versionAt(process.env.VERCEL_GIT_COMMIT_SHA ?? "HEAD"));
}
