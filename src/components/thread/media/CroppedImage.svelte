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

  let frameWidth = $state(0);
  let frameHeight = $state(0);

  // The cropped part covers the frame, centred, the way object-cover would,
  // and the whole picture is laid out around it in percentages of the frame.
  // Only the frame's shape is needed, which zoom can't change: Safari counted
  // the preview's zoom twice in container units and drew the crop too small.
  const placement = $derived.by(() => {
    if (!crop) {
      return null;
    }
    const frameAspect = frameHeight ? frameWidth / frameHeight : crop.aspect;
    const partWidth = Math.max(1, crop.aspect / frameAspect);
    const partHeight = Math.max(1, frameAspect / crop.aspect);
    const percent = (value: number) => `${value * 100}%`;
    return {
      width: percent(partWidth / crop.width),
      height: percent(partHeight / crop.height),
      left: percent((1 - partWidth) / 2 - (partWidth * crop.x) / crop.width),
      top: percent((1 - partHeight) / 2 - (partHeight * crop.y) / crop.height),
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
    class={["relative cursor-pointer overflow-hidden", className]}
    bind:clientWidth={frameWidth}
    bind:clientHeight={frameHeight}
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
