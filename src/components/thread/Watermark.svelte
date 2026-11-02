<script lang="ts">
  let { class: className = "" }: { class?: string } = $props();
</script>

<!-- The site's wordmark, faint so it stays out of the way. -->
<p
  class={[
    "font-display text-[13px] font-extrabold tracking-[-0.02em] whitespace-nowrap text-ap-text opacity-35",
    className,
  ]}
>
  threadshot.app
</p>
