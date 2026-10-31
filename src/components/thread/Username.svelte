<script lang="ts">
  import { REDACTED } from "../../functions/util/censorText";
  import { editor } from "../../lib/editor.svelte";

  let { name }: { name: string } = $props();
</script>

<!-- The "u/" is always shown; only the name is replaced when redacting. -->
<span>u/{editor.isCensorUsernames ? REDACTED : name}</span>
