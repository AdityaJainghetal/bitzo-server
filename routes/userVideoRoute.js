// const express = require("express");
// const router = express.Router();
// const {
//   getAllVideos,
//   getVideoById,
//   addView,
//   likeVideo,
//   dislikeVideo,
//   getVideoInteraction
// } = require("../controller/userVideoController");

// const isAuthenticated = require("../middlewares/isAuthenticated");

// // Public routes

// // Protected routes (require authentication)
// router.get("/", getAllVideos);
// router.get("/:videoId", getVideoById);
// router.post("/:videoId/view", addView);
// router.post("/:videoId/like", likeVideo);
// router.post("/:videoId/dislike", dislikeVideo);
// router.get("/:videoId/interaction", getVideoInteraction);

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getAllVideos,
  getVideoById,
  addView,
  likeVideo,
  dislikeVideo,
  getVideoInteraction,
  deleteComment,
  addComment,
  getComments,
  // dislikeVideo,
  // getVideoInteraction,
} = require("../controller/userVideoController");
// const isAuthenticated = require("../middlewares/Authmiddleware");

// Public routes (no auth required)
router.get("/",  getAllVideos);
router.get("/:id",  getVideoById);
router.post("/:videoId/view", addView);
router.post("/:videoId/like", likeVideo);
router.post("/:videoId/dislike", dislikeVideo);
router.get("/:videoId/interaction", getVideoInteraction);
router.delete("/:videoId/comment/:commentId", deleteComment);
router.post("/:videoId/comment" , addComment);
router.get("/:videoId/comments" , getComments);


module.exports = router;
