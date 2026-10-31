<script lang="ts">
  import type { RedditSubmission } from "../../../../types/reddit";
  import Title from "../../../ui/Title.svelte";
  import Album from "../media/Album.svelte";
  import Image from "../media/Image.svelte";
  import LinkPreview from "../media/LinkPreview.svelte";
  import SelfText from "../media/SelfText.svelte";
  import VideoThumbnail from "../media/VideoThumbnail.svelte";

  let { submission }: { submission: RedditSubmission } = $props();
</script>

{#if submission.linkType === "image"}
  <Image src={submission.url ?? ""} />
{:else if submission.linkType === "self"}
  <SelfText {submission} />
{:else if submission.linkType === "video"}
  <VideoThumbnail {submission} />
{:else if submission.linkType === "album"}
  <Album {submission} />
{:else if submission.linkType === "external"}
  <LinkPreview {submission} />
{:else}
  <Title>This reddit submission type has not been implemented!</Title>
{/if}
