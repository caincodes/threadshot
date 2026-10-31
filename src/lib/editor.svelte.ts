import { domToBlob } from "modern-screenshot";

import type { RedactStyle } from "../functions/util/censorText";
import {
  formatCommentTimestamp,
  formatTimestamp,
  type DateFormat,
  type TimeDisplay,
  type TimeFormat,
} from "../functions/util/format";
import type { CommentSort } from "../types/reddit";

export type ScreenshotTheme = "light" | "dark";
export type PostBodyMode = "full" | "snippet" | "off";

const FILE_NAME = "threadshot.png";

// Touch devices share the image, since a download lands in the Files app.
export const isTouchDevice = () => matchMedia("(pointer: coarse)").matches;

export const canShareFile = (file: File) =>
  navigator.canShare?.({ files: [file] }) ?? false;

const isCancelled = (error: unknown) =>
  error instanceof DOMException && error.name === "AbortError";

// Shared editor state. The editor is a single client-only island, so one
// module-level instance is enough.
class EditorState {
  theme = $state<ScreenshotTheme>("light");
  hideWatermark = $state(false);
  imageColumns = $state(3);
  postBody = $state<PostBodyMode>("full");
  // The snippet shown in the image, and the text highlighted to become it.
  bodySnippet = $state<string | null>(null);
  bodySelection = $state<string | null>(null);
  isCensorUsernames = $state(false);
  isCensorSubreddits = $state(false);
  redactStyle = $state<RedactStyle>("box");
  hidePostTags = $state(false);
  hideUserFlair = $state(false);
  showSubredditIcon = $state(false);
  showProfileIcons = $state(false);
  hideBots = $state(true);
  showComments = $state(true);
  topLevelComments = $state(2);
  commentReplies = $state(1);
  replyDepth = $state(3);
  commentSort = $state<CommentSort>("best");
  showDate = $state(true);
  dateFormat = $state<DateFormat>("short");
  timeDisplay = $state<TimeDisplay>("today");
  timeFormat = $state<TimeFormat>("12h");
  isDownloading = $state(false);
  // The finished image, shown in full when the share sheet could not open.
  exported = $state<{ file: File; url: string } | null>(null);

  // How many settings only shown in Advanced have been moved off their default.
  get changedAdvancedCount() {
    return [
      this.commentSort !== "best",
      this.commentReplies !== 1,
      this.replyDepth !== 3,
      !this.hideBots,
      this.dateFormat !== "short",
      this.timeDisplay !== "today",
      this.timeFormat !== "12h",
      this.redactStyle !== "box",
      this.hidePostTags,
      this.hideUserFlair,
    ].filter(Boolean).length;
  }

  timestamp = (createdUtc: number) => formatTimestamp(createdUtc, this);
  commentTimestamp = (createdUtc: number, postUtc: number) =>
    formatCommentTimestamp(createdUtc, postUtc, this);

  // iOS often refuses to share once rendering has used up the tap, so if this
  // fails the image is shown with its own Share button, which is a new tap.
  private sendToTouchDevice = async (file: File) => {
    if (canShareFile(file)) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch (error) {
        if (isCancelled(error)) {
          return;
        }
      }
    }
    this.exported = { file, url: URL.createObjectURL(file) };
  };

  shareExported = async () => {
    if (!this.exported) {
      return;
    }
    try {
      await navigator.share({ files: [this.exported.file] });
      this.closeExported();
    } catch (error) {
      if (!isCancelled(error)) {
        alert("Sharing did not work. Press and hold the image to save it.");
      }
    }
  };

  closeExported = () => {
    if (this.exported) {
      URL.revokeObjectURL(this.exported.url);
      this.exported = null;
    }
  };

  download = async () => {
    this.isDownloading = true;
    try {
      const node = document.getElementById("reddit-preview");
      if (!node) {
        throw new Error(
          "Can't find the preview to generate an image from."
        );
      }

      // The export lays text out slightly differently from the live page. Each
      // cloned element would otherwise keep the exact height AND width it had
      // on screen, so a title that wraps differently leaves a gap, and a
      // shrink-to-fit header that now needs one pixel more wraps onto a second
      // line and pushes the bottom out of the image. Let every cloned box size
      // itself from its content instead. The card keeps its 390px width, images
      // keep their size, and boxes that must stay fixed opt out with
      // data-keep-size. The size is passed in because the preview is zoomed out
      // on narrow screens, which would otherwise shrink and clip the image.
      const blob = await domToBlob(node, {
        width: node.offsetWidth,
        height: node.offsetHeight,
        scale: 3,
        backgroundColor: getComputedStyle(node).backgroundColor,
        onCloneEachNode: (cloned) => {
          if (
            cloned instanceof HTMLElement &&
            !(cloned instanceof HTMLImageElement) &&
            !cloned.hasAttribute("data-keep-size")
          ) {
            cloned.style.height = "auto";
            if (cloned.id !== node.id) {
              cloned.style.width = "auto";
            }
          }
        },
      });

      if (isTouchDevice()) {
        await this.sendToTouchDevice(
          new File([blob], FILE_NAME, { type: "image/png" })
        );
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = FILE_NAME;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      this.isDownloading = false;
    }
  };
}

export const editor = new EditorState();
