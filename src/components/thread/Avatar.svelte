<script lang="ts">
  import uniqolor from "uniqolor";
  import User from "phosphor-svelte/lib/User";

  interface Props {
    seed: string;
    kind: "user" | "subreddit";
    censored?: boolean;
    size?: number;
  }

  let { seed, kind, censored = false, size = 28 }: Props = $props();

  // Dark enough that white glyphs stay readable on every generated color.
  const color = $derived(
    uniqolor(seed, { saturation: [45, 70], lightness: [30, 42] }).color
  );
</script>

<span
  class="inline-flex shrink-0 items-center justify-center rounded-full text-white"
  style:width="{size}px"
  style:height="{size}px"
  style:background-color={censored ? "var(--rd-line)" : color}
>
  {#if !censored}
    {#if kind === "subreddit"}
      <span class="text-[11px] leading-none font-bold">r/</span>
    {:else}
      <User size={size * 0.6} weight="fill" />
    {/if}
  {/if}
</span>
