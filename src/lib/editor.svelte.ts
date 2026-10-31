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
  hideTags = $state(false);
  hideBots = $state(true);
  showComments = $state(true);
  topLevelComments = $state(2);
  commentReplies = $state(1);
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

      // The export lays text out slightly differently from the live page. Each
      // cloned element would otherwise keep the exact height AND width it had
      // on screen, so a title that wraps differently leaves a gap, and a
      // shrink-to-fit header that now needs one pixel more wraps onto a second
      // line and pushes the bottom out of the image. Let every cloned box size
      // itself from its content instead. The card keeps its 390px width, images
      // keep their size, and boxes that must stay fixed opt out with
      // data-keep-size.
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
            if (cloned.id !== node.id) {
              cloned.style.width = "auto";
            }
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
