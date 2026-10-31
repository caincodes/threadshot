import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { EditorContextProvider, useEditorData } from "../contexts/EditorContext";
import { EditorCanvas } from "./editor/EditorCanvas";
import { EditorInterface } from "./editor/EditorInterface";
import { useRedditData } from "./editor/useRedditData";

const queryClient = new QueryClient();

interface EditorScreenProps {
  subreddit: string;
  postId: string;
  commentId: string | null;
}

const EditorScreen = ({ subreddit, postId, commentId }: EditorScreenProps) => {
  const { commentSort } = useEditorData();
  const { data, isLoading, isError } = useRedditData(
    subreddit,
    postId,
    commentId,
    commentSort
  );

  return (
    <div className="grid max-h-[calc(100vh-96px)] max-w-screen animate-fade-in grid-cols-[repeat(auto-fit,minmax(min(100%,500px),1fr))] items-center gap-3">
      <EditorInterface />
      <EditorCanvas
        comments={data?.[1]}
        isError={isError}
        isLoading={isLoading}
        submission={data?.[0]}
      />
    </div>
  );
};

export default function Editor() {
  const params = new URLSearchParams(window.location.search);
  const subreddit = params.get("sub");
  const postId = params.get("postId");

  if (!subreddit || !postId) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <EditorContextProvider>
        <EditorScreen
          commentId={params.get("commentId")}
          postId={postId}
          subreddit={subreddit}
        />
      </EditorContextProvider>
    </QueryClientProvider>
  );
}
