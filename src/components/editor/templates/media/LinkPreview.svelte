<script lang="ts">
  import { editor } from "../../../../lib/editor.svelte";
  import type { RedditSubmission } from "../../../../types/reddit";
  import Caption from "../../../ui/Caption.svelte";
  import LinkIcon from "../../../ui/LinkIcon.svelte";
  import Image from "./Image.svelte";

  let { submission }: { submission: RedditSubmission } = $props();

  const host = $derived(submission.url ? new URL(submission.url).host : "");
</script>

{#if submission.preview}
  <div class="flex overflow-hidden rounded-lg border border-gray-200">
    <div class="relative flex justify-center">
      <Image src={submission.preview.images[0].source.url} />
      <div
        class="absolute bottom-0 flex h-4 w-full items-center justify-center gap-1 bg-black/30"
      >
        <LinkIcon color={editor.theme.background[400]} />
        <Caption style="color: {editor.theme.background[400]}">{host}</Caption>
      </div>
    </div>
  </div>
{/if}
