<script lang="ts">
  import LogoMark from "../LogoMark.svelte";

  let { class: className = "" }: { class?: string } = $props();
</script>

<!-- The site's logo, faint so it stays out of the way. -->
<p
  class={[
    "flex items-center justify-end gap-1 font-display text-[13px] font-extrabold tracking-[-0.02em] whitespace-nowrap text-ap-text opacity-35",
    className,
  ]}
>
  <LogoMark class="size-[15px] shrink-0" isMono isSmall />
  threadshot.app
</p>
