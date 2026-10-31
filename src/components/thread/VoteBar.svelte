<script lang="ts">
  import ArrowFatDown from "phosphor-svelte/lib/ArrowFatDown";
  import ArrowFatUp from "phosphor-svelte/lib/ArrowFatUp";

  import { formatCount } from "../../functions/util/format";

  let { score, pill = false }: { score: number; pill?: boolean } = $props();
</script>

<span
  class={[
    "inline-flex items-center gap-1 text-xs font-semibold",
    pill ? "rd-pill px-1.5" : "text-rd-muted",
  ]}
>
  <span class="inline-flex size-6 items-center justify-center">
    <ArrowFatUp size={16} weight="bold" />
  </span>
  <span class="text-rd-text">{formatCount(score)}</span>
  <span class="inline-flex size-6 items-center justify-center">
    <ArrowFatDown size={16} weight="bold" />
  </span>
</span>
