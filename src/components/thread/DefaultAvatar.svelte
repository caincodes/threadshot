<script lang="ts">
  import type { AvatarColors } from "../../functions/util/defaultAvatar";

  // Reddit's default avatar, the Snoo seen from behind, in the given colours.
  // Drawn inline so it needs no request and stays sharp at any size.
  let { colors, size = 20 }: { colors: AvatarColors; size?: number } =
    $props();

  const { background, fill, line } = $derived(colors);
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
      d="M34.5 102 L34.5 101 C34.5 93 36.3 84.5 41 80 L42 72 L65 72 L66.5 78 C70.5 82.5 74.3 90 74.3 101 L74.3 102 Z"
      fill={fill}
    />
    <path d="M63.4 79 C66 82.5 69 88 69 102" fill="none" />
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
