<script lang="ts">
  import type { XLinkCard } from "../../../types/x";
  import { proxiedImageSrc } from "../media/proxy";

  let { card }: { card: XLinkCard } = $props();
</script>

<div class="overflow-hidden rounded-2xl border border-ap-line">
  {#if card.image}
    <div class="relative">
      <img
        class="aspect-[1.91/1] w-full bg-ap-line object-cover"
        alt="Link preview"
        src={proxiedImageSrc(card.image)}
        data-keep-size
      />
      <span
        class="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-[4px] bg-black/70 px-1.5 text-[13px] text-white"
        >{card.title}</span
      >
    </div>
    {#if card.domain}
      <p class="px-3 py-2 text-[13px] text-ap-muted">From {card.domain}</p>
    {/if}
  {:else}
    <div class="px-3 py-2 text-[14px]">
      {#if card.domain}<p class="text-ap-muted">{card.domain}</p>{/if}
      <p>{card.title}</p>
    </div>
  {/if}
</div>
