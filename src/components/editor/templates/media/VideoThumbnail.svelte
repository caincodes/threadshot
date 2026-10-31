<script lang="ts">
  import type { RedditSubmission } from "../../../../types/reddit";
  import { proxiedImageSrc } from "./proxy";

  let { submission }: { submission: RedditSubmission } = $props();
</script>

{#if submission.preview}
  <div class="flex overflow-hidden rounded-lg border border-gray-200">
    <div class="relative flex justify-center">
      <img
        class="flex h-full w-full"
        alt="reddit content"
        src={proxiedImageSrc(submission.preview.images[0].source.url)}
      />
      <div
        class="absolute flex h-full w-full items-center justify-center bg-black/10"
      >
        <svg
          class="size-12 fill-white"
          aria-hidden="true"
          viewBox="0 0 26 26"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon points="9.33 6.69 9.33 19.39 19.3 13.04 9.33 6.69" />
        </svg>
      </div>
    </div>
  </div>
{/if}
