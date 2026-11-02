<script lang="ts">
  import { defaultAvatarColors } from "../../functions/util/defaultAvatar";
  import DefaultAvatar from "./DefaultAvatar.svelte";
  import { proxiedImageSrc } from "./media/proxy";

  let {
    src,
    name,
    size = 20,
    hasFallback = true,
    isSquare = false,
  }: {
    src?: string;
    name: string;
    size?: number;
    hasFallback?: boolean;
    isSquare?: boolean;
  } = $props();

  let hasFailed = $state(false);
</script>

<!-- Reddit's pictures go through the proxy; the sample's own are served here. -->
{#if src && !hasFailed}
  <img
    class={[
      "shrink-0 bg-ap-line object-cover",
      isSquare ? "rounded-[22%]" : "rounded-full",
    ]}
    alt=""
    height={size}
    onerror={() => (hasFailed = true)}
    src={src.startsWith("/") ? src : proxiedImageSrc(src)}
    width={size}
  />
{:else if hasFallback}
  <DefaultAvatar colors={defaultAvatarColors(name)} {size} />
{/if}
