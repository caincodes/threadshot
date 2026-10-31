<script lang="ts">
  import uniqolor from "uniqolor";

  import { editor } from "../../lib/editor.svelte";

  let { name }: { name: string } = $props();
</script>

{#if editor.isCensorUsernames}
  <span
    class="inline-block h-3 w-14 rounded-sm align-middle"
    style:background-color={uniqolor(name).color}
  ></span>
{:else}
  <span>{name}</span>
{/if}
