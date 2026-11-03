<script lang="ts">
  import { editor } from "../../../lib/editor.svelte";

  // A picture filling its frame, cropped as chosen in the editor. The frame
  // takes its size from the class it is given. Tapping it in the preview opens
  // the crop.
  let {
    src,
    alt,
    mediaKey,
    class: className = "",
  }: {
    src: string;
    alt: string;
    mediaKey?: string;
    class?: string;
  } = $props();

  const crop = $derived(mediaKey ? editor.mediaCrops[mediaKey] : undefined);

  // The cropped part covers the frame, centred, the way object-cover would.
  // It is sized against the frame with container units, and the whole picture
  // is then laid out around it. The image keeps these sizes in the export.
  const placement = $derived.by(() => {
    if (!crop) {
      return null;
    }
    const part = {
      width: `max(100cqw, 100cqh * ${crop.aspect})`,
      height: `max(100cqh, 100cqw / ${crop.aspect})`,
    };
    return {
      width: `calc(${part.width} / ${crop.width})`,
      height: `calc(${part.height} / ${crop.height})`,
      left: `calc((100cqw - ${part.width}) / 2 - ${part.width} * ${crop.x / crop.width})`,
      top: `calc((100cqh - ${part.height}) / 2 - ${part.height} * ${crop.y / crop.height})`,
    };
  });

  const openCrop = () => {
    if (mediaKey) {
      editor.openCrop(mediaKey, src);
    }
  };
</script>

{#if mediaKey}
  <div
    class={["@container-size relative cursor-pointer overflow-hidden", className]}
    data-keep-size
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
  {#if placement}
    <img
      class="absolute max-w-none"
      style:width={placement.width}
      style:height={placement.height}
      style:left={placement.left}
      style:top={placement.top}
      {alt}
      draggable="false"
      {src}
    />
  {:else}
    <img class="size-full object-cover" {alt} draggable="false" {src} />
  {/if}
{/snippet}
