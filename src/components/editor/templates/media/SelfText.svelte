<script lang="ts">
  import { applyCensoring } from "../../../../functions/util/censorText";
  import { editor } from "../../../../lib/editor.svelte";
  import type { RedditSubmission } from "../../../../types/reddit";
  import Paragraph from "../../../ui/Paragraph.svelte";

  let { submission }: { submission: RedditSubmission } = $props();

  const body = $derived(
    submission.selftext_html
      ? applyCensoring(submission.selftext_html, {
          subreddits: editor.isCensorSubreddits,
          usernames: editor.isCensorUsernames,
        })
      : ""
  );
</script>

{#if submission.selftext_html}
  <div
    class="flex max-w-full rounded-lg border p-2"
    style:background-color={editor.theme.background["100"]}
    style:border-color={editor.theme.background["300"]}
  >
    <Paragraph html={body} style="color: {editor.theme.contrast[300]}" />
  </div>
{/if}
