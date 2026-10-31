<script lang="ts">
    import { editor } from "../../lib/editor.svelte";
  import Redacted from "./Redacted.svelte";

  let { name }: { name: string } = $props();
</script>

<!-- The "u/" stays when the name is covered, and both go when it is hidden. -->
{#if !editor.isCensorUsernames}
  <span>u/{name}</span>
{:else if editor.redactStyle !== "hide"}
  <span>u/<Redacted {name} /></span>
{/if}
