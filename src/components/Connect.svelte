<script lang="ts">
  import { checkCredentials } from "../lib/credentialRules";
  import { credentials } from "../lib/credentials.svelte";

  // Show the form even when a key is saved, e.g. after Reddit rejected it.
  let { editing = false }: { editing?: boolean } = $props();

  const uid = $props.id();

  let clientId = $state("");
  let clientSecret = $state("");
  let error = $state("");
  let isChanging = $state(false);

  const isConnected = $derived(
    credentials.value !== null && !isChanging && !editing
  );

  const mask = (id: string) =>
    id.length > 8 ? `${id.slice(0, 4)}…${id.slice(-3)}` : id;

  const save = (event: SubmitEvent) => {
    event.preventDefault();
    const id = clientId.trim();
    const secret = clientSecret.trim();
    const problem = checkCredentials(id, secret || undefined);
    if (problem) {
      error = problem;
      return;
    }
    credentials.save({ clientId: id, clientSecret: secret || undefined });
    clientId = "";
    clientSecret = "";
    error = "";
    isChanging = false;
  };
</script>

{#if isConnected && credentials.value}
  <div
    class="flex flex-wrap items-center justify-between gap-3 border border-line p-4"
  >
    <p class="text-sm">
      Connected with client ID
      <span class="font-semibold">{mask(credentials.value.clientId)}</span>
    </p>
    <div class="flex gap-2">
      <button
        class="btn btn-secondary h-9 px-3 text-sm"
        onclick={() => (isChanging = true)}
        type="button"
      >
        Change
      </button>
      <button
        class="btn btn-secondary h-9 px-3 text-sm"
        onclick={() => credentials.forget()}
        type="button"
      >
        Forget my key
      </button>
    </div>
  </div>
{:else}
  <form class="flex flex-col gap-3 border border-line p-4" onsubmit={save} novalidate>
    <h2 class="font-display text-xl font-extrabold tracking-[-0.02em]">
      Connect your Reddit app
    </h2>
    <p class="text-sm text-ink-2">
      threadshot.app reads posts through Reddit's API using your own app, so nobody
      else's key is involved. Paste your app's client ID below.
    </p>

    <div class="flex flex-col gap-1">
      <label class="text-sm font-semibold" for="{uid}-client-id">
        Client ID
      </label>
      <div class="flex flex-col gap-2 sm:flex-row">
        <input
          id="{uid}-client-id"
          class="field sm:flex-1"
          autocapitalize="off"
          autocomplete="off"
          bind:value={clientId}
          spellcheck="false"
          type="text"
        />
        <a
          class="btn btn-secondary sm:shrink-0"
          href="/get-a-key"
          rel="noopener"
          target="_blank"
        >
          How to get a key
        </a>
      </div>
    </div>
    <label class="flex flex-col gap-1">
      <span class="text-sm font-semibold">
        Client secret
        <span class="font-normal text-ink-2">
          (only for script or web apps, leave empty otherwise)
        </span>
      </span>
      <input
        class="field"
        autocapitalize="off"
        autocomplete="off"
        bind:value={clientSecret}
        spellcheck="false"
        type="password"
      />
    </label>

    {#if error}
      <p class="text-sm font-medium text-accent" role="alert">{error}</p>
    {/if}

    <div class="mt-1 flex flex-wrap items-center gap-3">
      <button class="btn btn-primary" type="submit">Save and continue</button>
      {#if isChanging}
        <button
          class="btn btn-secondary"
          onclick={() => (isChanging = false)}
          type="button"
        >
          Cancel
        </button>
      {/if}
    </div>

    <p class="text-xs text-ink-2">
      Stored in this browser only. It travels over HTTPS to this site's server so
      it can talk to Reddit for you, and is never saved there. Reddit may need to
      approve your app first. No app? Use the
      <a class="link" href="/#bookmark">bookmark</a> instead.
    </p>
  </form>
{/if}
