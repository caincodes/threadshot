// Reddit's thumbnail is a video's first frame, so a video that opens on black
// gets a black thumbnail. v.redd.it allows cross-origin reads, so the browser
// can take a better frame from the video itself.

// Average brightness out of 255, below which a frame counts as black.
const BLACK_LUMA = 12;
const TIMEOUT_MS = 10000;

// Thread data can come from a crafted link, so only Reddit's video host loads.
const VIDEO_URL = /^https:\/\/v\.redd\.it\//;

export const isVideoUrl = (url: string | undefined): url is string =>
  url !== undefined && VIDEO_URL.test(url);

export const isBlack = (source: CanvasImageSource) => {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 18;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return false;
  }
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  }
  return total / (data.length / 4) < BLACK_LUMA;
};

const once = (video: HTMLVideoElement, event: string) =>
  new Promise<void>((resolve, reject) => {
    video.addEventListener(event, () => resolve(), { once: true });
    video.addEventListener("error", () => reject(video.error), { once: true });
  });

const seek = (video: HTMLVideoElement, time: number) => {
  const seeked = once(video, "seeked");
  video.currentTime = time;
  return seeked;
};

const capture = (video: HTMLVideoElement) => {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d")?.drawImage(video, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.92);
};

const firstLitFrame = async (video: HTMLVideoElement) => {
  await once(video, "loadeddata");
  const { duration } = video;
  for (const time of [1, duration * 0.25, duration * 0.5, duration * 0.75]) {
    await seek(video, Math.min(time, duration));
    if (!isBlack(video)) {
      return capture(video);
    }
  }
  return null;
};

// The first frame worth showing as a data URL, or null if there isn't one, such
// as when the browser won't load the video.
export const videoFrame = async (url: string): Promise<string | null> => {
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), TIMEOUT_MS);
  });
  try {
    return await Promise.race([firstLitFrame(video), timeout]);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    video.removeAttribute("src");
    video.load();
  }
};
