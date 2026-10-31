<script lang="ts">
  import { proxiedImageSrc } from "./media/proxy";

  let {
    src,
    name,
    size = 20,
  }: { src?: string; name: string; size?: number } = $props();

  let hasFailed = $state(false);
  // Without a picture, the first letter of the name stands in.
  const initial = $derived(name.match(/[a-z0-9]/i)?.[0].toUpperCase() ?? "");
</script>

{#if src && !hasFailed}
  <img
    class="shrink-0 rounded-full bg-ap-line object-cover"
    alt=""
    height={size}
    onerror={() => (hasFailed = true)}
    src={proxiedImageSrc(src)}
    width={size}
  />
{:else}
  <span
    class="inline-flex shrink-0 items-center justify-center rounded-full bg-ap-line font-semibold text-ap-muted"
    style:width="{size}px"
    style:height="{size}px"
    style:font-size="{Math.round(size * 0.5)}px"
    aria-hidden="true">{initial}</span
  >
{/if}
