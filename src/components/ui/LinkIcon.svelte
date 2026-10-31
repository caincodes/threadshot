<script lang="ts">
  let { color = "currentColor" }: { color?: string } = $props();
</script>

<svg
  class="size-3.5 shrink-0"
  aria-hidden="true"
  fill="none"
  stroke={color}
  stroke-linecap="round"
  stroke-linejoin="round"
  stroke-width="2"
  viewBox="0 0 24 24"
>
  <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
  <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
</svg>
