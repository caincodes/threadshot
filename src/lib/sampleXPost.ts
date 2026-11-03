import type { XPost } from "../types/x";

// A made-up post on X for the home page preview, in the same woodworking world
// as the sample Reddit thread. The people in it are not real. The photo is a
// CC0 stock photo from Unsplash, via Wikimedia Commons ("Shaving wood").
const NOW = Math.floor(Date.now() / 1000);

export const sampleXPost = (): XPost => ({
  id: "sample",
  author: {
    name: "Ines Varga",
    handle: "plane_and_simple",
    avatar: "/sample/x-maker.svg",
    isSquare: false,
    verified: null,
  },
  createdUtc: NOW - 1800,
  html:
    "<p>Fourth try and the drawer finally slides like it should. Cut the tails first, pared every socket by hand, no glue in the dry fit.</p>" +
    "<p>Thanks for the tip <a>@sharp_chisel_co</a>. Marking knife over pencil changes everything. <a>#woodworking</a></p>",
  likes: 2412,
  replies: 187,
  reposts: 96,
  media: [
    { type: "photo", url: "/sample/hand-plane.jpg", width: 1280, height: 778 },
  ],
  parent: {
    id: "sample-parent",
    author: {
      name: "Sharp Chisel Co.",
      handle: "sharp_chisel_co",
      avatar: "/sample/x-tools.svg",
      isSquare: true,
      verified: null,
    },
    createdUtc: NOW - 7200,
    html: "<p>Show us your first dovetails. Gaps and all.</p>",
    likes: 840,
    replies: 312,
    media: [],
  },
});
