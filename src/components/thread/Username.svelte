<script lang="ts">
    import { editor } from "../../lib/editor.svelte";
  import Redacted from "./Redacted.svelte";

  // Comments show the bare name; the post's author keeps its "u/".
  let { name, hasPrefix = true }: { name: string; hasPrefix?: boolean } =
    $props();
</script>

<!-- The "u/" stays when the name is covered, and both go when it is hidden. -->
{#if !editor.isCensorUsernames}
  <span>{hasPrefix ? "u/" : ""}{name}</span>
{:else if editor.redactStyle !== "hide"}
  <span>{hasPrefix ? "u/" : ""}<Redacted {name} /></span>
{/if}
