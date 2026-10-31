import * as htmlToImage from "html-to-image";

import { lightTheme } from "../styles/themes";
import type { CommentSort } from "../types/reddit";

// Shared editor state. The editor is a single client-only island, so one
// module-level instance is enough.
class EditorState {
  theme = lightTheme;
  imageScale = "100%";

  imageColumns = $state(3);
  isCensorUsernames = $state(false);
  isCensorSubreddits = $state(false);
  showComments = $state(true);
  topLevelComments = $state(5);
  commentReplies = $state(5);
  replyDepth = $state(3);
  commentSort = $state<CommentSort>("best");
  isLoading = $state(false);

  download = async () => {
    this.isLoading = true;
    try {
      const node = document.getElementById("reddit-preview");
      if (!node) {
        throw new Error(
          "Can't find the image preview to generate an image from."
        );
      }

      const dataUrl = await htmlToImage.toPng(node, {
        backgroundColor: "white",
        pixelRatio: 2,
        width: node.clientWidth,
        height: node.scrollHeight,
        includeQueryParams: true,
        skipFonts: true,
      });

      const link = document.createElement("a");
      link.download = "post-share-web.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      this.isLoading = false;
    }
  };
}

export const editor = new EditorState();
