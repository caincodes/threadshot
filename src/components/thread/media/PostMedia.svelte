<script lang="ts">
  import ArrowSquareOut from "phosphor-svelte/lib/ArrowSquareOut";
  import Play from "phosphor-svelte/lib/Play";

  import { applyCensoring } from "../../../functions/util/censorText";
  import { aspectRatio, editor } from "../../../lib/editor.svelte";
  import type { RedditSubmission } from "../../../types/reddit";
  import CroppedImage from "./CroppedImage.svelte";
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
  const aspect = $derived(aspectRatio(editor.mediaAspect));

  // A lone picture keeps its own shape, up to the 520px height limit, until a
  // shape or crop is chosen. Its shape is only known once it has loaded.
  const PORTRAIT_LIMIT = 390 / 520;
  let naturalAspect = $state<number | null>(null);
  const imageAspect = $derived(
    aspect ?? (naturalAspect && Math.max(PORTRAIT_LIMIT, naturalAspect))
  );
  const isImageFramed = $derived(
    Boolean(submission.url && editor.mediaCrops[submission.url]) ||
      aspect !== null
  );

  const openImageCrop = () => {
    if (submission.url) {
      editor.openCrop(submission.url, proxiedImageSrc(submission.url));
    }
  };

  const albumItems = $derived(
    Object.entries(submission.media_metadata ?? {})
      .map(([key, img]) => ({ key, url: img.s.u }))
      .filter((item) => editor.isMediaShown(item.url))
  );

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
    {#if isImageFramed && imageAspect}
      <div style:aspect-ratio={imageAspect}>
        <CroppedImage
          class="size-full bg-ap-line"
          alt="Post image"
          mediaKey={submission.url}
          src={proxiedImageSrc(submission.url)}
        />
      </div>
    {:else}
      <!-- Measured by the crop, which then frames it at this same shape. -->
      <div
        class="cursor-pointer"
        data-media-key={submission.url}
        onclick={openImageCrop}
        onkeydown={(event) => event.key === "Enter" && openImageCrop()}
        role="button"
        tabindex="0"
        title="Crop this picture"
      >
        <img
          class="max-h-[520px] w-full bg-ap-line object-contain"
          alt="Attached to the post"
          onload={(event) => {
            const { naturalWidth, naturalHeight } =
              event.currentTarget as HTMLImageElement;
            naturalAspect = naturalHeight ? naturalWidth / naturalHeight : null;
          }}
          src={proxiedImageSrc(submission.url)}
        />
      </div>
    {/if}
  </div>
{:else if submission.linkType === "album" && albumItems.length}
  <div
    class="grid gap-1 overflow-hidden rounded-[10px]"
    style:grid-template-columns="repeat({editor.imageColumns}, 1fr)"
  >
    {#each albumItems as item (item.key)}
      <div style:aspect-ratio={aspect ?? 1}>
        <CroppedImage
          class="size-full bg-ap-line"
          alt="Album item"
          mediaKey={item.url}
          src={proxiedImageSrc(item.url)}
        />
      </div>
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
