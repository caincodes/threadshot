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
