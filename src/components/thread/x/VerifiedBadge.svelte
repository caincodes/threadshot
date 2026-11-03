<script lang="ts">
  import SealCheck from "phosphor-svelte/lib/SealCheck";

  import type { XVerified } from "../../../types/x";

  let { kind, size = 17 }: { kind: XVerified; size?: number } = $props();

  const COLORS = {
    blue: "#1d9bf0",
    business: "#e2b719",
    government: "#829aab",
  } as const;
</script>

{#if kind}
  <span class="inline-flex shrink-0" style:color={COLORS[kind]} aria-label="Verified">
    <SealCheck {size} weight="fill" />
  </span>
{/if}
