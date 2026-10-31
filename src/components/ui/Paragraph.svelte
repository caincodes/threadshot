<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  // A div rather than a p: it can hold reddit's rendered HTML, which has <p>.
  let {
    children,
    class: className,
    html,
    ...rest
  }: HTMLAttributes<HTMLDivElement> & { html?: string } = $props();
</script>

<div class={["text-sm font-normal", className]} {...rest}>
  {#if html !== undefined}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- reddit's own sanitized HTML -->
    {@html html}
  {:else}
    {@render children?.()}
  {/if}
</div>
