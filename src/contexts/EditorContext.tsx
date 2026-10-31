import * as htmlToImage from "html-to-image";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { lightTheme, type Theme } from "../styles/themes";
import type { CommentSort } from "../types/reddit";

export interface EditorContextState {
  fontSize: "small" | "medium" | "large";
  imageScale: string;
  imageColumns: number;
  isCensorUsernames: boolean;
  isCensorSubreddits: boolean;
  theme: Theme;
  showComments: boolean;
  topLevelComments: number;
  commentReplies: number;
  replyDepth: number;
  commentSort: CommentSort;
  width: number;
  height: number;
  svgUri: string;
  isLoading: boolean;
}

export interface EditorContextFunctions {
  setProperty: <K extends keyof EditorContextState>(
    key: K,
    value: EditorContextState[K]
  ) => void;
  download: () => Promise<void>;
}

const initialState: EditorContextState = {
  fontSize: "medium",
  imageScale: "100%",
  imageColumns: 3,
  isCensorUsernames: false,
  isCensorSubreddits: false,
  theme: lightTheme,
  showComments: true,
  topLevelComments: 5,
  commentReplies: 5,
  replyDepth: 3,
  commentSort: "best",
  width: 0,
  height: 0,
  svgUri: "",
  isLoading: false,
};

const EditorDataContext = createContext<EditorContextState>(initialState);
const EditorMutationContext = createContext<EditorContextFunctions>({
  setProperty: () => undefined,
  download: async () => undefined,
});

export const useEditorData = (): EditorContextState =>
  useContext(EditorDataContext);

export const useEditorMutation = (): EditorContextFunctions =>
  useContext(EditorMutationContext);

const downloadImage = (dataUrl: string) => {
  const link = document.createElement("a");
  link.download = "post-share-web.png";
  link.href = dataUrl;
  link.click();
};

const makeDataURL = async () => {
  const node = document.getElementById("reddit-preview");
  if (!node) {
    throw new Error("Can't find the image preview to generate an image from.");
  }

  return htmlToImage.toPng(node, {
    backgroundColor: "white",
    pixelRatio: 2,
    width: node.clientWidth,
    height: node.scrollHeight,
    includeQueryParams: true,
    skipFonts: true,
  });
};

export const EditorContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<EditorContextState>(initialState);

  const setProperty = useCallback(
    <K extends keyof EditorContextState>(
      key: K,
      value: EditorContextState[K]
    ) => setState((prev) => ({ ...prev, [key]: value })),
    []
  );

  const download = useCallback(async () => {
    setProperty("isLoading", true);
    try {
      downloadImage(await makeDataURL());
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setProperty("isLoading", false);
    }
  }, [setProperty]);

  const mutation = useMemo(
    () => ({ setProperty, download }),
    [setProperty, download]
  );

  return (
    <EditorDataContext.Provider value={state}>
      <EditorMutationContext.Provider value={mutation}>
        {children}
      </EditorMutationContext.Provider>
    </EditorDataContext.Provider>
  );
};
