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

// Relative age in reddit's wording: "5 min. ago", "3 hr. ago", "2 days ago"
export const formatAgo = (createdUtc: number, now = Date.now()) => {
  const seconds = Math.max(0, Math.floor(now / 1000 - createdUtc));
  const units: Array<[number, string]> = [
    [31_536_000, "yr."],
    [2_592_000, "mo."],
    [86_400, "days"],
    [3600, "hr."],
    [60, "min."],
  ];

  for (const [size, label] of units) {
    if (seconds >= size) {
      const value = Math.floor(seconds / size);
      return `${value} ${label === "days" && value === 1 ? "day" : label} ago`;
    }
  }
  return "just now";
};
