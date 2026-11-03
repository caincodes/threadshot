<script lang="ts">
  import { editor, type MediaCrop } from "../../../lib/editor.svelte";

  // A picture filling its frame, cropped as chosen in the editor. The frame
  // takes its size from the class it is given. Tapping it in the preview opens
  // the crop.
  let {
    src,
    alt,
    mediaKey,
    crop: draft,
    class: className = "",
    onload,
  }: {
    src: string;
    alt: string;
    mediaKey?: string;
    // Shown instead of the saved crop while one is being changed.
    crop?: MediaCrop;
    class?: string;
    onload?: (image: HTMLImageElement) => void;
  } = $props();

  const crop = $derived(draft ?? (mediaKey && editor.mediaCrops[mediaKey]));
  const origin = $derived(crop ? `${crop.x}% ${crop.y}%` : undefined);

  const openCrop = () => {
    if (mediaKey) {
      editor.openCrop(mediaKey, src);
    }
  };
</script>

{#if mediaKey}
  <div
    class={["relative cursor-pointer overflow-hidden", className]}
    data-keep-size
    data-media-key={mediaKey}
    onclick={openCrop}
    onkeydown={(event) => event.key === "Enter" && openCrop()}
    role="button"
    tabindex="0"
    title="Crop this picture"
  >
    {@render picture()}
  </div>
{:else}
  <div class={["relative overflow-hidden", className]} data-keep-size>
    {@render picture()}
  </div>
{/if}

{#snippet picture()}
  <img
    class="size-full object-cover"
    style:object-position={origin}
    style:transform={crop && crop.zoom !== 1 ? `scale(${crop.zoom})` : undefined}
    style:transform-origin={origin}
    {alt}
    draggable="false"
    onload={(event) => onload?.(event.currentTarget as HTMLImageElement)}
    {src}
  />
{/snippet}
