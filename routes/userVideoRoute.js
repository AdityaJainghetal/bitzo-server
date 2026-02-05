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
  deleteChannel,
  getvideosByChannel,
  getChannelById,
  getChannels,
  createChannelByUploadVideo,
  createChannel,
  // dislikeVideo,
  // getVideoInteraction,
} = require("../controller/userVideoController");
// const isAuthenticated = require("../middlewares/Authmiddleware");
const upload = require("../middlewares/multer");
const isAuthenticated = require("../middlewares/isAuthenticated");
// Public routes (no auth required)
router.post("/createchannel", isAuthenticated, createChannel);
router.post("/create-channel-by-upload-video", upload.single("video"), createChannelByUploadVideo);
router.get("/channels", getChannels);
router.get("/channel/:id", getChannelById);
router.get("/channel/:id/videos", getvideosByChannel);
router.delete("/channel/:id", deleteChannel);

// Protected routes (require authentication)
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
