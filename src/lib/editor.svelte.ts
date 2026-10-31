import { domToPng } from "modern-screenshot";

import type { CommentSort } from "../types/reddit";

export type ScreenshotTheme = "light" | "dark";

// Shared editor state. The editor is a single client-only island, so one
// module-level instance is enough.
class EditorState {
  theme = $state<ScreenshotTheme>("light");
  showAttribution = $state(true);
  imageColumns = $state(3);
  isCensorUsernames = $state(false);
  isCensorSubreddits = $state(false);
  showComments = $state(true);
  topLevelComments = $state(5);
  commentReplies = $state(5);
  replyDepth = $state(3);
  commentSort = $state<CommentSort>("best");
  isDownloading = $state(false);

  download = async () => {
    this.isDownloading = true;
    try {
      const node = document.getElementById("reddit-preview");
      if (!node) {
        throw new Error(
          "Can't find the preview to generate an image from."
        );
      }

      // The export re-lays text out slightly differently from the live page,
      // so a title that wraps on screen can take one line fewer in the image.
      // Let every cloned box size to its own content instead of inheriting the
      // live heights, which would leave a blank gap. Fixed-size boxes opt out
      // with data-keep-size.
      const dataUrl = await domToPng(node, {
        scale: 3,
        backgroundColor: getComputedStyle(node).backgroundColor,
        onCloneEachNode: (cloned) => {
          if (
            cloned instanceof HTMLElement &&
            !(cloned instanceof HTMLImageElement) &&
            !cloned.hasAttribute("data-keep-size")
          ) {
            cloned.style.height = "auto";
          }
        },
      });

      const link = document.createElement("a");
      link.download = "threadshot.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      this.isDownloading = false;
    }
  };
}

export const editor = new EditorState();
