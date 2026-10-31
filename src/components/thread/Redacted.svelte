<script lang="ts">
  import { redactedHtml } from "../../functions/util/censorText";
  import { editor } from "../../lib/editor.svelte";

  let { name }: { name: string } = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -- built from the masked name -->
{@html redactedHtml(name, editor.redactStyle)}
