<script lang="ts">
  import { INK, VERMILION, smallSymbol, symbol } from "../../scripts/logo/geometry.mjs";

  // The threadshot symbol. One-colour marks follow the text colour, and the
  // small cut is drawn for sizes of 32px and under.
  let {
    class: className = "",
    isMono = false,
    isSmall = false,
  }: { class?: string; isMono?: boolean; isSmall?: boolean } = $props();

  const shape = $derived(isSmall ? smallSymbol : symbol);
</script>

<svg class={className} viewBox="0 0 256 256" aria-hidden="true" data-keep-size>
  <path fill={isMono ? "currentColor" : INK} d={shape.frame} />
  <path fill={isMono ? "currentColor" : VERMILION} d={shape.lines} />
</svg>
