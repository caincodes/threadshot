import type { ReactNode } from "react";

import { useEditorData } from "../../../../contexts/EditorContext";

interface ChildIndentProps {
  depth: number;
  id: string;
  children: ReactNode;
}

export const ChildIndent = ({ depth, id, children }: ChildIndentProps) => {
  const { theme } = useEditorData();

  if (depth === 0) {
    return <>{children}</>;
  }

  const replyColors = [
    theme.accents[500],
    theme.accents[400],
    theme.accents[300],
    theme.accents[200],
    theme.accents[100],
  ];

  return (
    <div className="flex flex-row gap-3">
      {Array.from({ length: depth }, (_, index) => (
        <div
          className="w-0.5 shrink-0"
          key={`${id}-${index}`}
          style={{ backgroundColor: replyColors[index % replyColors.length] }}
        />
      ))}
      {children}
    </div>
  );
};
