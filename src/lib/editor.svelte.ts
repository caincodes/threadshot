import * as htmlToImage from "html-to-image";

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

      const dataUrl = await htmlToImage.toPng(node, {
        pixelRatio: 2,
        width: node.clientWidth,
        height: node.scrollHeight,
        includeQueryParams: true,
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
