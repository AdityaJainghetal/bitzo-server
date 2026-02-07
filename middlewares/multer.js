// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("../config/cloudinary");

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     return {
//       folder: "ugc_videos",
//       resource_type: "video",
//       public_id: `video_${Date.now()}`,
//       allowed_formats: ["mp4", "mov", "mkv"],
//     };
//   },
// });

// const upload = multer({
//   storage,
//   limits: {
//     fileSize: 200 * 1024 * 1024
//   },
// });

// module.exports = upload;

const multer = require("multer");
const path = require("path");

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const memoryStorage = multer.memoryStorage();

// File filter for videos (MP4 only)
const videoFileFilter = (req, file, cb) => {
  if (file.mimetype === "video/mp4") {
    cb(null, true);
  } else {
    cb(new Error("Only MP4 videos allowed"), false);
  }
};

// File filter for images
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

// Video upload middleware (disk storage)
const videoUpload = multer({
  storage: diskStorage,
  fileFilter: videoFileFilter,
});

// Flexible upload middleware - accepts any file (for createuploadvideo)
const uploadAny = multer({
  storage: diskStorage,
  // No file filter - accept any file type
});

// Image upload middleware for channel creation (memory storage for imagekit)
const imageUpload = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
});

module.exports = videoUpload;
module.exports.uploadAny = uploadAny;
module.exports.imageUpload = imageUpload;
