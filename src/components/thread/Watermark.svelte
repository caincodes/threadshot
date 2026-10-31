<script lang="ts">
  let { class: className = "" }: { class?: string } = $props();
</script>

<p class={["text-xs whitespace-nowrap text-ap-muted italic", className]}>
  Captured with <span class="underline underline-offset-2">threadshot.app</span>
</p>
