// const multer = require("multer");
// const path = require("path");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("../config/cloudinary");

// /* =======================
//    DISK STORAGE (ALL FILES)
// ======================= */
// const diskStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// /* =======================
//    CLOUDINARY STORAGE
// ======================= */
// const cloudinaryStorage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     const isVideo = file.mimetype.startsWith("video/");
//     return {
//       folder: isVideo ? "videos" : "uploads",
//       resource_type: isVideo ? "video" : "image",
//     };
//   },
// });

// /* =======================
//    MULTER INSTANCES
// ======================= */

// // 1️⃣ Local upload (ANY FILE)
// const uploadLocal = multer({
//   storage: diskStorage,
//   limits: {
//     fileSize: 1024 * 1024 * 500, // 500MB
//   },
// });

// // 2️⃣ Cloudinary upload (ANY FILE)
// const uploadCloud = multer({
//   storage: cloudinaryStorage,
//   limits: {
//     fileSize: 1024 * 1024 * 500, // 500MB
//   },
// });

// // 3️⃣ Image only (OPTIONAL)
// const imageUpload = multer({
//   storage: multer.memoryStorage(),
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith("image/")) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only images allowed"), false);
//     }
//   },
// });

// module.exports = {
//   uploadLocal,
//   uploadCloud,
//   imageUpload,
// };


// middleware/uploadMiddleware.js  (or wherever you keep it)
const multer = require("multer");
const b2 = require("../utils/backblaze");

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 500 * 1024 * 1024 } // optional: 500MB limit
});

// Single middleware function (easier to read & maintain)
const backblazeUpload = async (req, res, next) => {
  // 1. Multer processes the file
  upload.single("video")(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.log("Multer error:", err);
      return res.status(400).json({
        success: false,
        message: err.message,           // e.g. "Unexpected field"
        errorCode: err.code
      });
    } else if (err) {
      console.error("Unknown upload error:", err);
      return res.status(500).json({ success: false, message: "Upload processing failed" });
    }

    // No file uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file uploaded"
      });
    }

    try {
      await b2.authorize();

      const uploadUrlResponse = await b2.getUploadUrl({
        bucketId: process.env.B2_BUCKET_ID,
      });

      const fileName = `videos/${Date.now()}-${req.file.originalname}`;

      const uploadResponse = await b2.uploadFile({
        uploadUrl: uploadUrlResponse.data.uploadUrl,
        uploadAuthToken: uploadUrlResponse.data.authorizationToken,
        fileName: fileName,
        data: req.file.buffer,
        mime: req.file.mimetype,
      });

      const videoUrl = `${process.env.B2_BUCKET_URL}/${uploadResponse.data.fileName}`;

      // Pass to next middleware / controller
      req.videoUrl = videoUrl;
      req.videoOriginalName = req.file.originalname;
      req.videoMime = req.file.mimetype;
      req.videoSize = req.file.size;

      next();
    } catch (error) {
      console.error("Backblaze upload failed:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload video to storage",
        error: error.message
      });
    }
  });
};

module.exports = backblazeUpload;