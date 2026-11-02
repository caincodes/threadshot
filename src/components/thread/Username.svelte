<script lang="ts">
  import { editor } from "../../lib/editor.svelte";
  import Redacted from "./Redacted.svelte";

  // Comments show the bare name; the post's author keeps its "u/". X handles
  // use "@".
  let { name, prefix = "u/" }: { name: string; prefix?: string } = $props();
</script>

<!-- The prefix stays when the name is covered, and both go when it is hidden. -->
{#if !editor.isCensorUsernames}
  <span>{prefix}{name}</span>
{:else if editor.redactStyle !== "hide"}
  <span>{prefix}<Redacted {name} /></span>
{/if}
