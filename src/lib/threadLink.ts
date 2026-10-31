import { isRawThread, type RawThread } from "./redditData";

// The iOS shortcut can't open a window to post a thread to, so it goes to the
// editor in the same tab with the thread in the URL fragment, which browsers
// never send to a server. See scripts/build-shortcut.mjs.
export const THREAD_FRAGMENT = "#t=";

const GZIP_MAGIC_BYTE = 0x1f;

export const decodeThread = async (encoded: string): Promise<RawThread> => {
  const binary = atob(encoded.replaceAll("-", "+").replaceAll("_", "/"));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  // The shortcut gzips when it can, and JSON never starts with this byte.
  const body =
    bytes[0] === GZIP_MAGIC_BYTE
      ? new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))
      : bytes;
  const thread: unknown = await new Response(body).json();
  if (!isRawThread(thread)) {
    throw new Error("Not a Reddit thread");
  }
  return thread;
};
