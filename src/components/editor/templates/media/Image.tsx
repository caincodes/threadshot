import { useEditorData } from "../../../../contexts/EditorContext";
import { proxiedImageSrc } from "./proxy";

interface ImageProps {
  src: string;
}

export const Image = ({ src }: ImageProps) => {
  const { imageScale } = useEditorData();

  return (
    <img
      alt="content"
      className="rounded-lg border border-gray-200"
      src={proxiedImageSrc(src)}
      style={{ height: imageScale, width: imageScale }}
    />
  );
};
