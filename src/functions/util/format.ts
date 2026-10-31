// Compact counts the way reddit shows them: 842, 1.2K, 12.3K, 1.1M
export const formatCount = (count: number) => {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(count);
};

// Compact relative age: "now", "5m", "3h", "2d", "4mo", "1y"
export const formatAgo = (createdUtc: number, now = Date.now()) => {
  const seconds = Math.max(0, Math.floor(now / 1000 - createdUtc));
  const units: Array<[number, string]> = [
    [31_536_000, "y"],
    [2_592_000, "mo"],
    [86_400, "d"],
    [3600, "h"],
    [60, "m"],
  ];

  for (const [size, label] of units) {
    if (seconds >= size) {
      return `${Math.floor(seconds / size)}${label}`;
    }
  }
  return "now";
};
