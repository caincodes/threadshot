import React from "react";

import { HomeScreenView } from "./view";

export const HomeScreenController: React.FC = () => {
  const handleSubmit = async (input: string) => {
    const redditUrlFormat =
      /\/r\/(?<sub>[\w]+)\/comments\/(?<postId>[\w]+)\/*[\w]*\/*(?<commentId>[\w]*)/;

    try {
      if (!input) {
        return;
      }
      const url = new URL(input);
      const { pathname } = url;
      const shareUrlFormat = /^\/r\/[\w-]+\/s\/[\w-]+\/?$/;
      if (shareUrlFormat.test(pathname)) {
        const res = await fetch(
          `/api/resolve?path=${encodeURIComponent(pathname)}`
        );
        if (!res.ok) {
          throw new Error("Could not resolve that reddit share link");
        }
        const { sub, postId, commentId } = await res.json();
        const shareParams = new URLSearchParams({ sub, postId });
        if (commentId) shareParams.set("commentId", commentId);
        window.location.href = `/generate?${shareParams.toString()}`;
        return;
      }
      if (!redditUrlFormat.test(pathname)) {
        throw new Error("Please enter a reddit submission or comment URL");
      }
      const redditParams = redditUrlFormat.exec(pathname)?.groups as Record<
        string,
        string
      >;
      const urlParams = new URLSearchParams(redditParams);
      window.location.href = `/generate?${urlParams.toString()}`;
    } catch (error: unknown) {
      throw Error(error as string);
    }
  };

  return <HomeScreenView onSubmit={handleSubmit} />;
};
