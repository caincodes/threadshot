<script lang="ts">
  import type { MoreChildren, RedditComment } from "../../../../types/reddit";
  import Comment from "./Comment.svelte";

  let { data }: { data: RedditComment | MoreChildren } = $props();
</script>

<div class="flex px-[18px] pb-1">
  <Comment {data} />
</div>
