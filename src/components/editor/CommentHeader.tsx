import { useEditorData } from "../../contexts/EditorContext";
import { Caption } from "../ui/typography";

export const CommentHeader = () => {
  const { commentSort, theme } = useEditorData();

  return (
    <Caption bold className="px-[18px]" style={{ color: theme.contrast[100] }}>
      Comments sorted by {commentSort}
    </Caption>
  );
};
