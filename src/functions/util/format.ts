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

export type DateFormat = "ago" | "short" | "long" | "us" | "world" | "iso";
export type TimeDisplay = "today" | "always" | "off";
export type TimeFormat = "12h" | "24h";

export interface TimestampOptions {
  showDate: boolean;
  dateFormat: DateFormat;
  timeDisplay: TimeDisplay;
  timeFormat: TimeFormat;
}

const twoDigits = (value: number) => String(value).padStart(2, "0");

// `withYear` false drops the year, for comments that only need the day.
export const formatDate = (
  date: Date,
  format: DateFormat,
  withYear = true
) => {
  const year = date.getFullYear();
  const month = twoDigits(date.getMonth() + 1);
  const day = twoDigits(date.getDate());
  switch (format) {
    case "ago":
      return formatAgo(date.getTime() / 1000);
    case "long":
    case "short":
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: format,
        year: withYear ? "numeric" : undefined,
      });
    case "us":
      return withYear ? `${month}/${day}/${year}` : `${month}/${day}`;
    case "world":
      return withYear ? `${day}/${month}/${year}` : `${day}/${month}`;
    case "iso":
      return withYear ? `${year}-${month}-${day}` : `${month}-${day}`;
  }
};

const formatTime = (date: Date, format: TimeFormat) => {
  const hours = date.getHours();
  const minutes = twoDigits(date.getMinutes());
  return format === "24h"
    ? `${twoDigits(hours)}:${minutes}`
    : `${hours % 12 || 12}:${minutes} ${hours < 12 ? "AM" : "PM"}`;
};

// A post's date, with the time too if asked for. Dates are in the viewer's own
// time zone, so "today" means their today. Empty when everything is switched off.
export const formatTimestamp = (
  createdUtc: number,
  { showDate, dateFormat, timeDisplay, timeFormat }: TimestampOptions,
  now = new Date()
) => {
  const date = new Date(createdUtc * 1000);
  if (showDate && dateFormat === "ago") {
    return formatAgo(createdUtc, now.getTime());
  }
  const showTime =
    timeDisplay === "always" ||
    (timeDisplay === "today" && date.toDateString() === now.toDateString());
  return [
    showDate && formatDate(date, dateFormat),
    showTime && formatTime(date, timeFormat),
  ]
    .filter(Boolean)
    .join(", ");
};

// A comment's time alone, with its date (minus the year) in front only when it
// was made on a different day from the post.
export const formatCommentTimestamp = (
  createdUtc: number,
  postUtc: number,
  { showDate, dateFormat, timeDisplay, timeFormat }: TimestampOptions
) => {
  if (showDate && dateFormat === "ago") {
    return formatAgo(createdUtc);
  }
  const date = new Date(createdUtc * 1000);
  const isPostDay =
    date.toDateString() === new Date(postUtc * 1000).toDateString();
  return [
    showDate && !isPostDay && formatDate(date, dateFormat, false),
    timeDisplay !== "off" && formatTime(date, timeFormat),
  ]
    .filter(Boolean)
    .join(", ");
};
