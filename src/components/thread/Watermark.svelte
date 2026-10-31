<script lang="ts">
  let { class: className = "" }: { class?: string } = $props();
</script>

<p class={["text-xs text-ap-muted italic", className]}>
  Made with <span class="underline underline-offset-2">threadshot.app</span>
</p>
