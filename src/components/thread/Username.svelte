<script lang="ts">
  import uniqolor from "uniqolor";

  import { editor } from "../../lib/editor.svelte";

  let { name }: { name: string } = $props();
</script>

{#if editor.isCensorUsernames}
  <span
    class="inline-block h-3 w-16 rounded-sm align-middle"
    data-keep-size
    style:background-color={uniqolor(name).color}
  ></span>
{:else}
  <span>{name}</span>
{/if}
