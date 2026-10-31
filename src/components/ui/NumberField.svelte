<script lang="ts">
  import CaretDown from "phosphor-svelte/lib/CaretDown";
  import CaretUp from "phosphor-svelte/lib/CaretUp";

  interface Props {
    value: number;
    min: number;
    max: number;
    label: string;
  }

  let { value = $bindable(), min, max, label }: Props = $props();

  const uid = $props.id();

  const set = (next: number) => {
    value = Math.min(max, Math.max(min, next));
  };

  const handleInput = (event: Event & { currentTarget: HTMLInputElement }) => {
    const next = event.currentTarget.valueAsNumber;
    if (!Number.isNaN(next)) {
      set(next);
    }
  };
</script>

{#snippet stepper(amount: number, name: string, Icon: typeof CaretUp)}
  <button
    class="flex w-11 cursor-pointer items-center justify-center bg-white text-ink transition-colors duration-150 -outline-offset-2 enabled:hover:bg-canvas enabled:active:bg-line disabled:cursor-not-allowed disabled:opacity-50"
    aria-label="{name} {label.toLowerCase()}"
    disabled={value + amount < min || value + amount > max}
    onclick={() => set(value + amount)}
    type="button"
  >
    <Icon size={16} weight="bold" />
  </button>
{/snippet}

<div class="flex min-h-12 items-center justify-between gap-3">
  <label class="text-sm" for={uid}>{label}</label>
  <!-- Touch browsers show no spin buttons on number inputs, so this draws its
       own and hides the desktop ones to keep one control everywhere. -->
  <div
    class="flex h-11 shrink-0 divide-x divide-line overflow-hidden rounded-ui border border-line"
  >
    {@render stepper(-1, "Decrease", CaretDown)}
    <input
      id={uid}
      class="w-11 bg-white text-center text-base text-ink tabular-nums -outline-offset-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      {max}
      {min}
      oninput={handleInput}
      type="number"
      {value}
    />
    {@render stepper(1, "Increase", CaretUp)}
  </div>
</div>
