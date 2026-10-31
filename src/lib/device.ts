export type Device = "ios" | "mac-safari" | "android" | "desktop";

export type SendMethod = "shortcut" | "extension" | "bookmark";

// The extension's install script needs this Safari. See extension/README.md.
const MIN_EXTENSION_SAFARI = 27;

export const detectDevice = (): Device => {
  const { maxTouchPoints, userAgent } = navigator;
  // iPads identify as Macs, but Macs have no touch screen.
  const isMac = userAgent.includes("Macintosh") && maxTouchPoints <= 1;
  if (/iPhone|iPad|iPod/.test(userAgent) || (userAgent.includes("Macintosh") && !isMac)) {
    return "ios";
  }
  if (userAgent.includes("Android")) {
    return "android";
  }
  // Chrome, Edge and Firefox on a Mac have no "Version/" token.
  const safari = /Version\/(\d+)[\d.]* Safari\//.exec(userAgent);
  return isMac && safari && Number(safari[1]) >= MIN_EXTENSION_SAFARI
    ? "mac-safari"
    : "desktop";
};

// The first method is the one that fits the device.
export const methodsFor = (device: Device): SendMethod[] => {
  switch (device) {
    case "ios":
      return ["shortcut", "extension", "bookmark"];
    case "mac-safari":
      return ["extension", "bookmark", "shortcut"];
    default:
      return ["bookmark", "extension", "shortcut"];
  }
};
