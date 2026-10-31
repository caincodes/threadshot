<script lang="ts">
  let { class: className }: { class?: string } = $props();
</script>

<span
  class={[
    "inline-block size-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary",
    className,
  ]}
  aria-label="Loading"
  role="status"
></span>
