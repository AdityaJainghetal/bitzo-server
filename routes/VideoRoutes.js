const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
// const isAuthenticated = require("../middlewares/isAuthenticated");
const { uploadVideo, getAllVideos, deleteVideo, updateVideoupdated } = require("../controller/videoController");

router.post(
  "/upload",
  // isAuthenticated,
  upload.single("video"),
  uploadVideo
);

router.get("/", getAllVideos);
router.put(
  "/update/:id",
  upload.single("video"),
  updateVideoupdated
);

router.delete("/:id", deleteVideo);

module.exports = router;
