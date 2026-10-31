import type { RedditSubmission } from "../../../../types/reddit";
import { proxiedImageSrc } from "./proxy";

interface VideoThumbnailProps {
  submission: RedditSubmission;
}

export const VideoThumbnail = ({ submission }: VideoThumbnailProps) => {
  const { preview } = submission;

  if (!preview) {
    return null;
  }

  const { url } = preview.images[0].source;

  return (
    <div className="flex overflow-hidden rounded-lg border border-gray-200">
      <div className="relative flex justify-center">
        <img
          alt="reddit content"
          className="flex h-full w-full"
          src={proxiedImageSrc(url)}
        />
        <div className="absolute flex h-full w-full items-center justify-center bg-black/10">
          <svg
            aria-hidden="true"
            className="size-12 fill-white"
            viewBox="0 0 26 26"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon points="9.33 6.69 9.33 19.39 19.3 13.04 9.33 6.69" />
          </svg>
        </div>
      </div>
    </div>
  );
};
