<script lang="ts">
  // Reddit's default avatar, the Snoo seen from behind, in one of its colours.
  // Drawn inline so it needs no request and stays sharp at any size.
  let { hue, size = 20 }: { hue: number; size?: number } = $props();

  const background = $derived(`hsl(${hue} 100% 48%)`);
  const fill = $derived(`hsl(${hue} 100% 34%)`);
  const line = $derived(`hsl(${hue} 100% 21%)`);
</script>

<svg
  class="shrink-0 rounded-full"
  aria-hidden="true"
  height={size}
  viewBox="0 0 100 100"
  width={size}
>
  <rect width="100" height="100" fill={background} />
  <g
    stroke={line}
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.6"
  >
    <path
      d="M34.5 102 C34.5 89 39.5 80.5 50 79.5 C62 78.5 74.5 86 74.5 102 Z"
      fill={fill}
    />
    <path d="M64 79 C68 84 69.6 92 69.6 102" fill="none" />
    <path
      d="M47.2 86.8 C45 90 44 95 44.2 101 L45.6 101 C45.4 95 46 90 47.2 86.8 Z"
      fill={line}
      stroke-width="0.6"
    />
    <circle cx="73.8" cy="45.3" r="7.6" fill={fill} />
    <ellipse cx="50.8" cy="57.4" rx="29.9" ry="23.6" fill={fill} />
    <!-- The left ear is drawn whole, then the head is filled again over its
         inner edge, leaving the two short strokes Reddit's drawing has. -->
    <circle cx="27.8" cy="52.2" r="10.2" fill={fill} />
    <ellipse cx="50.8" cy="57.4" rx="29" ry="22.7" fill={fill} stroke="none" />
    <path d="M28 42 Q33.6 42 36.6 46.6" fill="none" />
    <path d="M20 58 Q23.5 62.2 28.4 62.6" fill="none" />
    <path d="M31 25.2 L42.6 16.2" fill="none" />
    <path
      d="M42 16.4 C45.6 22 47.6 28.5 47.8 37.6 C49.8 31 48.8 22 43.4 15.8 Z"
      fill={line}
      stroke-width="0.8"
    />
    <circle cx="24" cy="27.6" r="7.4" fill={fill} />
  </g>
</svg>
