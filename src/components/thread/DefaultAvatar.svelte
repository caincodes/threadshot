<script lang="ts">
  // Reddit's default avatar, the Snoo seen from behind, in one of its colours.
  // Drawn inline so it needs no request and stays sharp at any size.
  let { hue, size = 20 }: { hue: number; size?: number } = $props();

  const background = $derived(`hsl(${hue} 100% 47%)`);
  const fill = $derived(`hsl(${hue} 100% 33%)`);
  const line = $derived(`hsl(${hue} 100% 24%)`);
</script>

<svg
  class="shrink-0 rounded-full"
  aria-hidden="true"
  height={size}
  viewBox="0 0 100 100"
  width={size}
>
  <rect width="100" height="100" fill={background} />
  <g stroke={line} stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6">
    <path d="M34 101 C34 86 41 79.5 50 79 C62 78.5 75 86 75 101 Z" fill={fill} />
    <path d="M46.7 87.5 Q44 93 43.6 101" fill="none" />
    <path d="M63.5 78.8 Q69 88 69 101" fill="none" />
    <circle cx="74.5" cy="48" r="6.3" fill={fill} />
    <ellipse cx="50" cy="57.5" rx="31.3" ry="23.3" fill={fill} transform="rotate(-6 50 57.5)" />
    <circle cx="27.5" cy="52" r="9.8" fill={fill} />
    <ellipse cx="50" cy="57.5" rx="30.5" ry="22.5" fill={fill} stroke="none" transform="rotate(-6 50 57.5)" />
    <path d="M27.5 41.8 Q32.5 41.5 36 46" fill="none" />
    <path d="M21.2 59.8 Q24 62.4 27.8 62.6" fill="none" />
    <path d="M32 25 L42.4 16.2 Q49.5 26 47.6 37.4" fill="none" />
    <circle cx="24.5" cy="27.7" r="7.4" fill={fill} />
  </g>
</svg>
