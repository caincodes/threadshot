<script lang="ts">
  import ArrowSquareOut from "phosphor-svelte/lib/ArrowSquareOut";
  import Play from "phosphor-svelte/lib/Play";

  import { applyCensoring } from "../../../functions/util/censorText";
  import { editor } from "../../../lib/editor.svelte";
  import type { RedditSubmission } from "../../../types/reddit";
  import { proxiedImageSrc } from "./proxy";

  let { submission }: { submission: RedditSubmission } = $props();

  const selfText = $derived(
    submission.selftext_html
      ? applyCensoring(submission.selftext_html, {
          subreddits: editor.isCensorSubreddits,
          usernames: editor.isCensorUsernames,
        })
      : ""
  );
  const previewUrl = $derived(submission.preview?.images[0]?.source.url);
  const host = $derived.by(() => {
    try {
      return submission.url ? new URL(submission.url).host : "";
    } catch {
      return "";
    }
  });
</script>

{#snippet picture(src: string, alt: string)}
  <img
    class="max-h-[520px] w-full bg-ap-line object-contain"
    {alt}
    src={proxiedImageSrc(src)}
  />
{/snippet}

{#if submission.linkType === "self"}
  {#if selfText}
    <div class="md text-base leading-[22px]">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -- reddit's own sanitized HTML -->
      {@html selfText}
    </div>
  {/if}
{:else if submission.linkType === "image" && submission.url}
  <div class="overflow-hidden rounded-[10px]">
    {@render picture(submission.url, "Post image")}
  </div>
{:else if submission.linkType === "album" && submission.media_metadata}
  <div
    class="grid gap-1 overflow-hidden rounded-[10px]"
    style:grid-template-columns="repeat({editor.imageColumns}, 1fr)"
  >
    {#each Object.entries(submission.media_metadata) as [key, img] (key)}
      <img
        class="aspect-square w-full bg-ap-line object-cover"
        alt="Album item"
        src={proxiedImageSrc(img.s.u)}
      />
    {/each}
  </div>
{:else if submission.linkType === "video" && previewUrl}
  <div class="relative overflow-hidden rounded-[10px]">
    {@render picture(previewUrl, "Video thumbnail")}
    <span class="absolute inset-0 flex items-center justify-center bg-black/10">
      <span
        class="flex size-14 items-center justify-center rounded-full bg-black/60 text-white"
        data-keep-size
      >
        <Play size={26} weight="fill" />
      </span>
    </span>
  </div>
{:else if submission.linkType === "external" && previewUrl}
  <div class="relative overflow-hidden rounded-[10px]">
    {@render picture(previewUrl, "Link preview")}
    <span
      class="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-black/60 px-3 py-1.5 text-xs font-semibold text-white"
    >
      {host}
      <ArrowSquareOut size={14} weight="bold" />
    </span>
  </div>
{:else if submission.linkType === "external" && host}
  <p class="text-sm font-semibold text-ap-link">{host}</p>
{/if}
