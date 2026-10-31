<script lang="ts">
  import { editor } from "../../lib/editor.svelte";
  import Caption from "../ui/Caption.svelte";
</script>

<Caption bold class="px-[18px]" style="color: {editor.theme.contrast[100]}">
  Comments sorted by {editor.commentSort}
</Caption>
