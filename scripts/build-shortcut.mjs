// Builds and signs public/threadshot.shortcut, the iOS way to send a post here.
// iOS Safari refuses javascript: bookmarks, but a shortcut may run a script on
// the page it was shared from, with the visitor's own Reddit session. Signing
// needs macOS and an iCloud account:
//
//   node scripts/build-shortcut.mjs [origin] [output path]
//
// Shared from Safari, it reads the post and opens the editor in the same tab,
// because window.open is blocked there. Shared from the Reddit app, it has only
// a URL: Reddit blocks downloads made by the shortcut itself, so it opens the
// post in Safari to be shared again.
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
    return "Open a Reddit post first, then run this shortcut again.";
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

const inputType = id();
const result = id();
const expanded = id();
const safariUrl = id();
const source = id();
const problem = id();

const workflow = {
  WFWorkflowClientVersion: "2607.0.5",
  WFWorkflowMinimumClientVersion: 900,
  WFWorkflowMinimumClientVersionString: "900",
  WFWorkflowIcon: { WFWorkflowIconStartColor: 463140863, WFWorkflowIconGlyphNumber: 59511 },
  WFWorkflowTypes: ["ActionExtension"],
  WFWorkflowInputContentItemClasses: ["WFSafariWebPageContentItem", "WFURLContentItem"],
  WFWorkflowHasShortcutInputVariables: true,
  WFWorkflowActions: [
    action("getitemtype", {
      UUID: inputType,
      WFInput: attachment(shortcutInput),
    }),
    conditional(source, IF, {
      WFCondition: CONTAINS,
      WFConditionalActionString: "Safari",
      WFInput: {
        Type: "Variable",
        Variable: attachment(output(inputType, "Type")),
      },
    }),
    action("runjavascriptonwebpage", {
      UUID: result,
      WFInput: attachment(shortcutInput),
      WFJavaScript: script,
    }),
    conditional(problem, IF, {
      WFCondition: HAS_ANY_VALUE,
      WFInput: {
        Type: "Variable",
        Variable: attachment(output(result, "JavaScript Result")),
      },
    }),
    action("showresult", { Text: text(output(result, "JavaScript Result")) }),
    conditional(problem, END_IF),
    conditional(source, OTHERWISE),
    action("url.expand", { UUID: expanded, URL: text(shortcutInput) }),
    // A plain https link to Reddit would bounce straight back to the Reddit app.
    action("text.replace", {
      UUID: safariUrl,
      WFInput: text(output(expanded, "Expanded URL")),
      WFReplaceTextRegularExpression: true,
      WFReplaceTextFind: "^https://",
      WFReplaceTextReplace: "x-safari-https://",
    }),
    action("alert", {
      WFAlertActionTitle: "Opening in Safari",
      WFAlertActionMessage: "Then tap Share in Safari and choose threadshot again.",
      WFAlertActionCancelButtonShown: false,
    }),
    action("openurl", {
      WFInput: attachment(output(safariUrl, "Updated Text")),
      Show: true,
    }),
    conditional(source, END_IF),
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
