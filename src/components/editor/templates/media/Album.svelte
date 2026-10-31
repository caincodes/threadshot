<script lang="ts">
  import { editor } from "../../../../lib/editor.svelte";
  import type { RedditSubmission } from "../../../../types/reddit";
  import Image from "./Image.svelte";

  let { submission }: { submission: RedditSubmission } = $props();
</script>

{#if submission.media_metadata}
  <div
    class="grid gap-2"
    style:grid-template-columns="repeat({editor.imageColumns}, 1fr)"
  >
    {#each Object.entries(submission.media_metadata) as [key, img] (key)}
      <Image src={img.s.u} />
    {/each}
  </div>
{/if}
