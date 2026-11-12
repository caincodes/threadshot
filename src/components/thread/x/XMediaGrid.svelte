<script lang="ts">
  import Play from "phosphor-svelte/lib/Play";

  import { editor } from "../../../lib/editor.svelte";
  import type { XMedia } from "../../../types/x";
  import CroppedImage from "../media/CroppedImage.svelte";
  import MediaTag from "../media/MediaTag.svelte";
  import { xImageSrc } from "../media/proxy";

  // Flush media fills the bottom of a quoted post, which has its own border.
  // Only the main post's pictures can be chosen, reshaped and cropped.
  let {
    media,
    isFlush = false,
    isEditable = false,
  }: { media: XMedia[]; isFlush?: boolean; isEditable?: boolean } = $props();

  const shown = $derived(
    (isEditable ? media.filter((item) => editor.isMediaShown(item.url)) : media)
      .slice(0, 4)
  );
  // One picture keeps its shape within limits, or takes the shape it was
  // cropped to; several share a 16:9 frame.
  const ratio = $derived.by(() => {
    if (shown.length !== 1) {
      return 16 / 9;
    }
    const [{ url, width, height }] = shown;
    const crop = isEditable && editor.mediaCrops[url];
    if (crop) {
      return crop.aspect;
    }
    return Math.min(16 / 9, Math.max(3 / 4, width / height));
  });
  // A video showing a frame picked from it is tagged instead of given a play
  // button. GIFs are always tagged.
</script>

{#if shown.length}
  <div
    class={[
      "grid gap-0.5 overflow-hidden",
      !isFlush && "rounded-2xl border border-ap-line",
      shown.length > 1 && "grid-cols-2",
      shown.length > 2 && "grid-rows-2",
    ]}
    style:aspect-ratio={ratio}
    data-keep-size
  >
    {#each shown as item, index (item.url)}
      {@const hasFrame = isEditable && Boolean(editor.mediaFrames[item.url])}
      <div
        class={[
          "relative min-h-0 overflow-hidden bg-ap-line",
          shown.length === 3 && index === 0 && "row-span-2",
        ]}
      >
        <CroppedImage
          class="size-full"
          alt={item.type === "photo" ? "Post image" : "Video thumbnail"}
          mediaKey={isEditable ? item.url : undefined}
          src={xImageSrc(item.url)}
          video={item.video}
        />
        {#if item.type !== "photo" && !hasFrame}
          <span class="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
              class="flex size-12 items-center justify-center rounded-full bg-black/60 text-white"
              data-keep-size
            >
              <Play size={22} weight="fill" />
            </span>
          </span>
        {/if}
        {#if item.type === "gif"}
          <MediaTag label="GIF" />
        {:else if item.type === "video" && hasFrame}
          <MediaTag label="Video" />
        {/if}
      </div>
    {/each}
  </div>
{/if}
