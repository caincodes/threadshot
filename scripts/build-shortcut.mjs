// Builds and signs public/threadshot.shortcut, the iOS way to send a post here.
// Signing needs macOS and an iCloud account:
//
//   node scripts/build-shortcut.mjs [origin] [output path]
//
// X: posts load on this app's server, so a link is all it needs. It takes the
// link from the Share sheet (the X app, Safari or anywhere else) or, when run
// with no input (Home Screen, widget, Siri, the Action button), from the
// clipboard, and opens the editor. No script runs, so this works without
// "Allow Running Scripts".
//
// Reddit: iOS Safari refuses javascript: bookmarks, but a shortcut may run a
// script on the page it was shared from, with the visitor's own Reddit session.
// Shared from Safari, it reads the post and opens the editor in the same tab,
// because window.open is blocked there. With only a link (the Reddit app, the
// Share buttons on Reddit's own pages, or the clipboard), Reddit blocks
// downloads made by the shortcut itself, so it opens the post in Safari to be
// shared again.
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const origin = process.argv[2] ?? "https://threadshot.app";
const outputPath = process.argv[3] ?? "public/threadshot.shortcut";

// The shape of the fragment must match decodeThread in src/lib/threadLink.ts.
// CompressionStream has thrown on input in the shortcut's script environment, so
// a thread that can't be compressed is sent as it is rather than not at all.
const script = `
const origin = ${JSON.stringify(origin)};
const compress = async (bytes) => {
  try {
    const compressor = new CompressionStream("gzip");
    const writer = compressor.writable.getWriter();
    writer.write(bytes.buffer).catch(() => {});
    writer.close().catch(() => {});
    return new Uint8Array(await new Response(compressor.readable).arrayBuffer());
  } catch {
    return bytes;
  }
};
const read = async () => {
  if (!/^\\/r\\/[\\w-]+\\/comments\\/\\w+/.test(location.pathname)) {
    return "Open a post on X or Reddit first, then run this shortcut again.";
  }
  const path = location.pathname.replace(/\\/$/, "");
  const response = await fetch(path + ".json?raw_json=1&context=10000&limit=500");
  if (!response.ok) {
    return "Reddit answered " + response.status + ".";
  }
  const bytes = await compress(new TextEncoder().encode(await response.text()));
  let binary = "";
  for (let i = 0; i < bytes.length; i += 32768) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
  }
  const encoded = btoa(binary).replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/, "");
  // Safari loaded 1.9 MB URLs in testing and showed a blank page at 3.4 MB.
  if (encoded.length > 1900000) {
    return "This thread is too long to send.";
  }
  location.href = origin + "/generate?from=reddit#t=" + encoded;
};
read().then(
  (problem) => completion(problem),
  (error) => completion("Could not read this post: " + error.message)
);
`;

const id = () => randomUUID().toUpperCase();
const output = (uuid, name) => ({ OutputName: name, OutputUUID: uuid, Type: "ActionOutput" });
const attachment = (value) => ({ Value: value, WFSerializationType: "WFTextTokenAttachment" });
const shortcutInput = { Type: "ExtensionInput" };

const text = (reference) => ({
  Value: { string: "￼", attachmentsByRange: { "{0, 1}": reference } },
  WFSerializationType: "WFTextTokenString",
});

const action = (name, parameters = {}) => ({
  WFWorkflowActionIdentifier: `is.workflow.actions.${name}`,
  WFWorkflowActionParameters: parameters,
});

const conditional = (group, mode, parameters = {}) =>
  action("conditional", {
    GroupingIdentifier: group,
    WFControlFlowMode: mode,
    ...parameters,
  });

const IF = 0;
const OTHERWISE = 1;
const END_IF = 2;
const CONTAINS = 99;
const HAS_ANY_VALUE = 100;

// Any X post link becomes this site's /i/status/{id}, which opens the editor.
// A link that does not match is left as it was.
const X_LINK =
  "^https?://(?:www\\.|mobile\\.)?(?:x|twitter|fxtwitter|vxtwitter|fixupx|fixvx)\\.com/(?:\\w+|i/web|i)/status(?:es)?/(\\d+).*$";
const X_EDITOR = `${origin}/i/status/`;

const links = id();
const firstLink = id();
const directX = id();
const expanded = id();
const expandedX = id();
const inputType = id();
const result = id();
const safariUrl = id();
const hasLink = id();
const isDirectX = id();
const isExpandedX = id();
const source = id();
const problem = id();
const isReddit = id();

const variable = (reference) => ({ Type: "Variable", Variable: attachment(reference) });

const toXEditor = (uuid, input) =>
  action("text.replace", {
    UUID: uuid,
    WFInput: text(input),
    WFReplaceTextRegularExpression: true,
    WFReplaceTextFind: X_LINK,
    WFReplaceTextReplace: `${X_EDITOR}$1`,
  });

const ifContains = (group, reference, value) =>
  conditional(group, IF, {
    WFCondition: CONTAINS,
    WFConditionalActionString: value,
    WFInput: variable(reference),
  });

const alert = (title, message) =>
  action("alert", {
    WFAlertActionTitle: title,
    WFAlertActionMessage: message,
    WFAlertActionCancelButtonShown: false,
  });

const workflow = {
  WFWorkflowClientVersion: "2607.0.5",
  WFWorkflowMinimumClientVersion: 900,
  WFWorkflowMinimumClientVersionString: "900",
  WFWorkflowIcon: { WFWorkflowIconStartColor: 463140863, WFWorkflowIconGlyphNumber: 59511 },
  WFWorkflowTypes: ["ActionExtension"],
  WFWorkflowInputContentItemClasses: [
    "WFSafariWebPageContentItem",
    "WFURLContentItem",
    "WFStringContentItem",
  ],
  // Run from the Home Screen, a widget, Siri or the Action button, it reads a
  // copied link instead of asking for the Share sheet.
  WFWorkflowNoInputBehavior: {
    Name: "WFWorkflowNoInputBehaviorGetClipboard",
    Parameters: {},
  },
  WFWorkflowHasShortcutInputVariables: true,
  WFWorkflowActions: [
    action("detect.link", { UUID: links, WFInput: attachment(shortcutInput) }),
    action("getitemfromlist", {
      UUID: firstLink,
      WFInput: attachment(output(links, "URLs")),
      WFItemSpecifier: "First Item",
    }),
    conditional(hasLink, IF, {
      WFCondition: HAS_ANY_VALUE,
      WFInput: variable(output(firstLink, "Item from List")),
    }),

    toXEditor(directX, output(firstLink, "Item from List")),
    ifContains(isDirectX, output(directX, "Updated Text"), X_EDITOR),
    action("openurl", { WFInput: attachment(output(directX, "Updated Text")), Show: true }),
    conditional(isDirectX, OTHERWISE),

    // t.co and other short links only show where they go once followed.
    action("url.expand", { UUID: expanded, URL: text(output(firstLink, "Item from List")) }),
    toXEditor(expandedX, output(expanded, "Expanded URL")),
    ifContains(isExpandedX, output(expandedX, "Updated Text"), X_EDITOR),
    action("openurl", { WFInput: attachment(output(expandedX, "Updated Text")), Show: true }),
    conditional(isExpandedX, OTHERWISE),

    action("getitemtype", { UUID: inputType, WFInput: attachment(shortcutInput) }),
    ifContains(source, output(inputType, "Type"), "Safari"),
    action("runjavascriptonwebpage", {
      UUID: result,
      WFInput: attachment(shortcutInput),
      WFJavaScript: script,
    }),
    conditional(problem, IF, {
      WFCondition: HAS_ANY_VALUE,
      WFInput: variable(output(result, "JavaScript Result")),
    }),
    action("showresult", { Text: text(output(result, "JavaScript Result")) }),
    conditional(problem, END_IF),
    conditional(source, OTHERWISE),

    ifContains(isReddit, output(expanded, "Expanded URL"), "reddit.com"),
    // A plain https link to Reddit would bounce straight back to the Reddit app.
    action("text.replace", {
      UUID: safariUrl,
      WFInput: text(output(expanded, "Expanded URL")),
      WFReplaceTextRegularExpression: true,
      WFReplaceTextFind: "^https://",
      WFReplaceTextReplace: "x-safari-https://",
    }),
    alert(
      "Use Safari's Share button",
      "Reddit posts are read from the page, and a link alone can't do that. The post will open in Safari. Then tap Safari's own Share button and choose threadshot."
    ),
    action("openurl", { WFInput: attachment(output(safariUrl, "Updated Text")), Show: true }),
    conditional(isReddit, OTHERWISE),
    alert("Not a post on X or Reddit", "Share a post from X or Reddit, or copy a post's link and run threadshot again."),
    conditional(isReddit, END_IF),

    conditional(source, END_IF),
    conditional(isExpandedX, END_IF),
    conditional(isDirectX, END_IF),

    conditional(hasLink, OTHERWISE),
    alert(
      "No link to a post",
      "Copy a link to a post on X or Reddit, then run threadshot again. Or tap Share on a post and choose threadshot."
    ),
    conditional(hasLink, END_IF),
  ],
};

const scratch = mkdtempSync(join(tmpdir(), "threadshot-shortcut-"));
try {
  const json = join(scratch, "workflow.json");
  const unsigned = join(scratch, "unsigned.shortcut");
  writeFileSync(json, JSON.stringify(workflow));
  execFileSync("plutil", ["-convert", "binary1", "-o", unsigned, json]);
  execFileSync("shortcuts", ["sign", "--mode", "anyone", "--input", unsigned, "--output", outputPath]);
} finally {
  rmSync(scratch, { recursive: true });
}
console.log(`Wrote ${outputPath} for ${origin}`);
