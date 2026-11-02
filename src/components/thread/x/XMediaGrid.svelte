<script lang="ts">
  import Play from "phosphor-svelte/lib/Play";

  import type { XMedia } from "../../../types/x";
  import { proxiedImageSrc } from "../media/proxy";

  // Flush media fills the bottom of a quoted post, which has its own border.
  let { media, isFlush = false }: { media: XMedia[]; isFlush?: boolean } =
    $props();

  const shown = $derived(media.slice(0, 4));
  // One picture keeps its shape within limits; several share a 16:9 frame.
  const ratio = $derived.by(() => {
    if (shown.length !== 1) {
      return 16 / 9;
    }
    const [{ width, height }] = shown;
    return Math.min(16 / 9, Math.max(3 / 4, width / height));
  });

  const sized = (url: string) =>
    proxiedImageSrc(url.includes("?") ? url : `${url}?name=large`);
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
      <div
        class={[
          "relative min-h-0 overflow-hidden bg-ap-line",
          shown.length === 3 && index === 0 && "row-span-2",
        ]}
      >
        <img
          class="size-full object-cover"
          alt={item.type === "photo" ? "Post image" : "Video thumbnail"}
          src={sized(item.url)}
        />
        {#if item.type !== "photo"}
          <span class="absolute inset-0 flex items-center justify-center">
            <span
              class="flex size-12 items-center justify-center rounded-full bg-black/60 text-white"
              data-keep-size
            >
              <Play size={22} weight="fill" />
            </span>
          </span>
        {/if}
        {#if item.type === "gif"}
          <span
            class="absolute bottom-2 left-2 rounded-[4px] bg-black/70 px-1 text-[11px] font-bold text-white"
            >GIF</span
          >
        {/if}
      </div>
    {/each}
  </div>
{/if}
