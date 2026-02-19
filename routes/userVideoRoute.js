
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
  uploadVideo,
} = require("../controller/userVideoController");
const { imageUpload } = require("../middlewares/multer");
const isAuthenticated = require("../middlewares/isAuthenticated");
const upload = require("../middlewares/multer");
const uploadToBackblaze = require("../middlewares/blazerMiddlware");
router.post(
  "/createchannel",
  isAuthenticated,
  imageUpload.fields([
    { name: "channelImage", maxCount: 1 },
    { name: "channelBanner", maxCount: 1 },
  ]),
  createChannel,
);

// router.post(
//   "/upload/:channelId",
//   isAuthenticated,
//   ...uploadToBackblaze,
//   uploadVideo
// );


router.post(
  "/upload/:channelId",                               // protects the route
  isAuthenticated,
  upload.videoAndThumbnailUpload.fields([
    { name: "video",     maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  uploadVideo
);
router.get("/channel", getChannels);
router.get("/channel/:id", getChannelById);
router.get("/channel/:id/videos", getvideosByChannel);
router.delete("/channel/:id", deleteChannel);

router.get("/", getAllVideos);
router.get("/:id", getVideoById);
router.post("/:videoId/view", addView);
router.post("/:videoId/like", likeVideo);
router.post("/:videoId/dislike", dislikeVideo);
router.get("/:videoId/interaction", getVideoInteraction);
router.delete("/:videoId/comment/:commentId", deleteComment);
router.post("/:videoId/comment", addComment);
router.get("/:videoId/comments", getComments);

module.exports = router;
