<script lang="ts">
  import type { Snippet } from "svelte";

  import { editor } from "../../../../lib/editor.svelte";

  interface Props {
    depth: number;
    children: Snippet;
  }

  let { depth, children }: Props = $props();

  const { accents } = editor.theme;
  const replyColors = [
    accents[500],
    accents[400],
    accents[300],
    accents[200],
    accents[100],
  ];
  const indentColors = $derived(
    Array.from({ length: depth }, (_item, index) => replyColors[index % replyColors.length])
  );
</script>

{#if depth === 0}
  {@render children()}
{:else}
  <div class="flex flex-row gap-3">
    {#each indentColors as color, index (index)}
      <div class="w-0.5 shrink-0" style:background-color={color}></div>
    {/each}
    {@render children()}
  </div>
{/if}
