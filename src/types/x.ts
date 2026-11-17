export type XVerified = "blue" | "business" | "government" | null;

export interface XAuthor {
  name: string;
  handle: string;
  avatar?: string;
  isSquare: boolean;
  verified: XVerified;
}

export interface XMedia {
  type: "photo" | "video" | "gif";
  url: string;
  width: number;
  height: number;
  // An MP4 of a video or GIF, to pick a frame from.
  video?: string;
}

export interface XLinkCard {
  title: string;
  domain: string;
  image?: string;
}

export interface XPost {
  id: string;
  author: XAuthor;
  createdUtc: number;
  html: string;
  // The whole text of a long post, when it could be loaded.
  fullHtml?: string;
  likes: number;
  replies: number;
  reposts?: number;
  media: XMedia[];
  card?: XLinkCard;
  quoted?: XPost;
  // The post this one answers, when X includes it.
  parent?: XPost;
  replyingTo?: string;
}
