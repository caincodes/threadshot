import { useEditorData } from "../../../../contexts/EditorContext";
import type { RedditSubmission } from "../../../../types/reddit";
import { Image } from "./Image";

interface AlbumProps {
  submission: RedditSubmission;
}

export const Album = ({ submission }: AlbumProps) => {
  const { media_metadata } = submission;
  const { imageColumns } = useEditorData();

  if (!media_metadata) {
    return null;
  }

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${imageColumns}, 1fr)` }}
    >
      {Object.entries(media_metadata).map(([key, img]) => (
        <Image key={key} src={img.s.u} />
      ))}
    </div>
  );
};
