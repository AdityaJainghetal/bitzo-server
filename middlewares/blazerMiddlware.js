const multer = require("multer");
const b2 = require("../utils/backblaze");

// multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// middleware
const backblazeUpload = [
  upload.single("video"),

  async (req, res, next) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No video file uploaded" });
      }

      // authorize account
      await b2.authorize();

      // get upload url
      const uploadUrlResponse = await b2.getUploadUrl({
        bucketId: process.env.B2_BUCKET_ID,
      });

      const fileName = `videos/${Date.now()}-${req.file.originalname}`;

      // upload file
      const uploadResponse = await b2.uploadFile({
        uploadUrl: uploadUrlResponse.data.uploadUrl,
        uploadAuthToken: uploadUrlResponse.data.authorizationToken,
        fileName: fileName,
        data: req.file.buffer,
        mime: req.file.mimetype,
      });

      // public video url
      const videoUrl = `${process.env.B2_BUCKET_URL}/${uploadResponse.data.fileName}`;

      // attach url to req for controller
      req.videoUrl = videoUrl;

      next();
    } catch (error) {
      console.error("Backblaze Upload Error:", error);
      res.status(500).json({
        success: false,
        message: "Video upload failed",
      });
    }
  },
];

module.exports = backblazeUpload;
