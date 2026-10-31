<script lang="ts">
  import Minus from "phosphor-svelte/lib/Minus";
  import Plus from "phosphor-svelte/lib/Plus";

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

{#snippet stepper(amount: number, name: string, Icon: typeof Plus)}
  <button
    class="flex w-7 cursor-pointer items-center justify-center text-ink transition-colors duration-150 -outline-offset-2 enabled:hover:bg-canvas enabled:active:bg-line disabled:cursor-not-allowed disabled:opacity-40 pointer-coarse:w-11"
    aria-label="{name} {label.toLowerCase()}"
    disabled={value + amount < min || value + amount > max}
    onclick={() => set(value + amount)}
    type="button"
  >
    <Icon size={14} weight="bold" />
  </button>
{/snippet}

<div class="option-row">
  <label class="text-sm" for={uid}>{label}</label>
  <!-- Touch browsers show no spin buttons on number inputs, so this draws its
       own and hides the desktop ones to keep one control everywhere. -->
  <div
    class="option-control flex shrink-0 overflow-hidden rounded-ui border border-line bg-white"
  >
    {@render stepper(-1, "Decrease", Minus)}
    <input
      id={uid}
      class="w-7 text-center text-sm font-medium text-ink tabular-nums -outline-offset-2 [appearance:textfield] pointer-coarse:w-9 pointer-coarse:text-base [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      {max}
      {min}
      oninput={handleInput}
      type="number"
      {value}
    />
    {@render stepper(1, "Increase", Plus)}
  </div>
</div>
