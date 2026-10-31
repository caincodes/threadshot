import type { ReactNode } from "react";

import { useEditorData, useEditorMutation } from "../../contexts/EditorContext";
import { SORT_TYPES, type CommentSort } from "../../types/reddit";
import { MultiSelect, NumberInput, Toggle } from "../ui/controls";
import { PrimaryButton } from "../ui/PrimaryButton";
import { Heading, Paragraph, Title } from "../ui/typography";

const Section = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-2">
    <Heading>{label}</Heading>
    {children}
  </div>
);

const Option = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-center justify-between gap-1">
    <Paragraph>{label}</Paragraph>
    {children}
  </div>
);

const Separator = () => <div className="h-px bg-surface-400" />;

export const EditorInterface = () => {
  const {
    isCensorUsernames,
    isCensorSubreddits,
    showComments,
    commentReplies,
    replyDepth,
    topLevelComments,
    commentSort,
    imageColumns,
    isLoading,
  } = useEditorData();
  const { setProperty, download } = useEditorMutation();

  return (
    <div className="flex max-w-screen flex-col items-center">
      <Title className="h-8">Image Options</Title>
      <div className="flex flex-col gap-1.5 rounded-lg bg-white px-[18px] py-1 text-left shadow-sm">
        <PrimaryButton isLoading={isLoading} onClick={download}>
          Download Image
        </PrimaryButton>
        <Section label="Privacy">
          <Option label="Censor Usernames">
            <Toggle
              isChecked={isCensorUsernames}
              label="Censor Usernames"
              onChange={() =>
                setProperty("isCensorUsernames", !isCensorUsernames)
              }
            />
          </Option>
          <Option label="Censor Subreddits">
            <Toggle
              isChecked={isCensorSubreddits}
              label="Censor Subreddits"
              onChange={() =>
                setProperty("isCensorSubreddits", !isCensorSubreddits)
              }
            />
          </Option>
        </Section>
        <Separator />
        <Section label="Submission">
          <Option label="Number of Image Album Columns">
            <NumberInput
              defaultValue={imageColumns}
              max={50}
              min={1}
              onChange={(value) => setProperty("imageColumns", value)}
            />
          </Option>
        </Section>
        <Separator />
        <Section label="Comments">
          <Option label="Show Comments">
            <Toggle
              isChecked={showComments}
              label="Show Comments"
              onChange={() => setProperty("showComments", !showComments)}
            />
          </Option>
          {showComments && (
            <>
              <Option label="Number of Top Level Comments">
                <NumberInput
                  defaultValue={topLevelComments}
                  max={50}
                  min={0}
                  onChange={(value) => setProperty("topLevelComments", value)}
                />
              </Option>
              <Option label="Comment Reply Depth">
                <NumberInput
                  defaultValue={replyDepth}
                  max={50}
                  min={0}
                  onChange={(value) => setProperty("replyDepth", value)}
                />
              </Option>
              <Option label="Number of Replies to Each Comment">
                <NumberInput
                  defaultValue={commentReplies}
                  max={50}
                  min={0}
                  onChange={(value) => setProperty("commentReplies", value)}
                />
              </Option>
              <Option label="Sort">
                <MultiSelect
                  aria-label="Sort"
                  defaultValue={commentSort}
                  onChange={(event) =>
                    setProperty(
                      "commentSort",
                      event.currentTarget.value as CommentSort
                    )
                  }
                >
                  {SORT_TYPES.map((sort) => (
                    <option key={sort}>{sort}</option>
                  ))}
                </MultiSelect>
              </Option>
            </>
          )}
        </Section>
      </div>
    </div>
  );
};
