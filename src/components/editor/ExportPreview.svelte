<script lang="ts">
  import Export from "phosphor-svelte/lib/Export";

  import { canShareFile, editor } from "../../lib/editor.svelte";
</script>

{#if editor.exported}
  <dialog
    {@attach (dialog) => dialog.showModal()}
    class="m-0 h-dvh max-h-none w-dvw max-w-none bg-white p-4"
    aria-label="Your image"
    onclose={editor.closeExported}
  >
    <div class="mx-auto flex h-full max-w-md flex-col gap-3">
      <img
        class="min-h-0 flex-1 object-contain"
        alt="Your thread"
        src={editor.exported.url}
      />
      <p class="text-center text-sm text-ink-2">
        Press and hold the image to save it.
      </p>
      {#if canShareFile(editor.exported.file)}
        <button class="btn btn-primary" onclick={editor.shareExported} type="button">
          <Export size={20} weight="bold" />
          Share image
        </button>
      {/if}
      <button class="btn btn-secondary" onclick={editor.closeExported} type="button">
        Close
      </button>
    </div>
  </dialog>
{/if}
