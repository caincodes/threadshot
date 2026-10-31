<script lang="ts">
  import { editor } from "../../lib/editor.svelte";
  import Caption from "../ui/Caption.svelte";

  const today = new Date().toDateString();
</script>

<Caption bold class="px-[18px]" style="color: {editor.theme.contrast[100]}">
  Captured via post-share-web on {today}
</Caption>
