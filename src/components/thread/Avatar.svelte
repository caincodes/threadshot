<script lang="ts">
  import { proxiedImageSrc } from "./media/proxy";

  let {
    src,
    name,
    size = 20,
    hasFallback = true,
  }: {
    src?: string;
    name: string;
    size?: number;
    hasFallback?: boolean;
  } = $props();

  // Reddit's pictures go through the proxy; the sample's own are served here.
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
    src={src.startsWith("/") ? src : proxiedImageSrc(src)}
    width={size}
  />
{:else if hasFallback}
  <span
    class="inline-flex shrink-0 items-center justify-center rounded-full bg-ap-line font-semibold text-ap-muted"
    style:width="{size}px"
    style:height="{size}px"
    style:font-size="{Math.round(size * 0.5)}px"
    aria-hidden="true">{initial}</span
  >
{/if}
