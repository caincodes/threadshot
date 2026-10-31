<script lang="ts">
  import ArrowSquareOut from "phosphor-svelte/lib/ArrowSquareOut";
  import Play from "phosphor-svelte/lib/Play";

  import { applyCensoring } from "../../../functions/util/censorText";
  import { editor } from "../../../lib/editor.svelte";
  import type { RedditSubmission } from "../../../types/reddit";
  import { proxiedImageSrc } from "./proxy";
  import { isBlack, isVideoUrl, videoFrame } from "./videoFrame";

  let { submission }: { submission: RedditSubmission } = $props();

  // Anything but "full" leaves the whole body showing until a snippet is chosen.
  const bodyHtml = $derived.by(() => {
    if (editor.postBody === "off") {
      return "";
    }
    const html =
      (editor.postBody === "snippet" && editor.bodySnippet) ||
      submission.selftext_html;
    return html
      ? applyCensoring(html, {
          subreddits: editor.isCensorSubreddits,
          usernames: editor.isCensorUsernames,
          style: editor.redactStyle,
        })
      : "";
  });
  const previewUrl = $derived(submission.preview?.images[0]?.source.url);
  let videoThumbnail = $state<string | null>(null);

  const videoUrl = $derived(submission.media?.reddit_video?.fallback_url);
  const videoSrc = $derived(
    videoThumbnail ?? (previewUrl && proxiedImageSrc(previewUrl))
  );

  const loadVideoFrame = async () => {
    if (isVideoUrl(videoUrl)) {
      videoThumbnail = await videoFrame(videoUrl);
    }
  };

  $effect(() => {
    if (submission.linkType === "video" && !previewUrl) {
      loadVideoFrame();
    }
  });

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

{#if submission.linkType === "image" && submission.url}
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
{:else if submission.linkType === "video" && videoSrc}
  <div class="relative overflow-hidden rounded-[10px]">
    <img
      class="max-h-[520px] w-full bg-ap-line object-contain"
      alt="Video thumbnail"
      onload={(event) => {
        if (!videoThumbnail && isBlack(event.currentTarget)) {
          loadVideoFrame();
        }
      }}
      src={videoSrc}
    />
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

{#if bodyHtml}
  <div
    class={["md text-base leading-[22px]", submission.linkType !== "self" && "mt-3"]}
    data-post-body
  >
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- cleaned by parseThread and snippetFromSelection -->
    {@html bodyHtml}
  </div>
{/if}
