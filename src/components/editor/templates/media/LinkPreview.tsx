import { useEditorData } from "../../../../contexts/EditorContext";
import type { RedditSubmission } from "../../../../types/reddit";
import { LinkIcon } from "../../../ui/Link";
import { Caption } from "../../../ui/typography";
import { Image } from "./Image";

interface LinkPreviewProps {
  submission: RedditSubmission;
}

export const LinkPreview = ({ submission }: LinkPreviewProps) => {
  const { preview, url: link } = submission;
  const { theme } = useEditorData();

  if (!preview) {
    return null;
  }

  const { url } = preview.images[0].source;
  const host = link ? new URL(link).host : "";

  return (
    <div className="flex overflow-hidden rounded-lg border border-gray-200">
      <div className="relative flex justify-center">
        <Image src={url} />
        <div className="absolute bottom-0 flex h-4 w-full items-center justify-center gap-1 bg-black/30">
          <LinkIcon color={theme.background[400]} />
          <Caption style={{ color: theme.background[400] }}>{host}</Caption>
        </div>
      </div>
    </div>
  );
};
