import { useEditorData } from "../../contexts/EditorContext";
import { Caption } from "../ui/typography";

export const Attribution = () => {
  const today = new Date().toDateString();
  const { theme } = useEditorData();

  return (
    <Caption bold className="px-[18px]" style={{ color: theme.contrast[100] }}>
      Captured via post-share-web on {today}
    </Caption>
  );
};
