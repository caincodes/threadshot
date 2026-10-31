<script lang="ts">
  interface Props {
    checked: boolean;
    label: string;
  }

  let { checked = $bindable(), label }: Props = $props();
</script>

<label class="option-row cursor-pointer">
  <span class="text-sm">{label}</span>
  <input class="peer sr-only" role="switch" type="checkbox" bind:checked />
  <span
    class="relative h-6 w-10 shrink-0 rounded-full bg-line transition-colors duration-150 peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:transition-transform after:duration-150 peer-checked:after:translate-x-4"
  ></span>
</label>
