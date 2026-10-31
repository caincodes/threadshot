<script lang="ts">
  let { class: className }: { class?: string } = $props();
</script>

<span
  class={[
    "inline-block size-5 animate-spin rounded-full border-2 border-current border-t-transparent",
    className,
  ]}
  aria-label="Loading"
  role="status"
></span>
