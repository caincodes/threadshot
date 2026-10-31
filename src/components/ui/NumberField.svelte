<script lang="ts">
  interface Props {
    value: number;
    min: number;
    max: number;
    label: string;
  }

  let { value = $bindable(), min, max, label }: Props = $props();

  const handleInput = (event: Event & { currentTarget: HTMLInputElement }) => {
    const next = event.currentTarget.valueAsNumber;
    if (!Number.isNaN(next)) {
      value = Math.min(max, Math.max(min, next));
    }
  };
</script>

<label class="flex min-h-12 items-center justify-between gap-3">
  <span class="text-sm">{label}</span>
  <input
    class="field w-20 text-center tabular-nums"
    {max}
    {min}
    oninput={handleInput}
    type="number"
    {value}
  />
</label>
