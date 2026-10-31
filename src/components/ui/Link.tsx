export const LinkIcon = ({ color }: { color?: string }) => (
  <svg
    aria-hidden="true"
    className="size-3.5 shrink-0"
    fill="none"
    stroke={color ?? "currentColor"}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
    <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
  </svg>
);
