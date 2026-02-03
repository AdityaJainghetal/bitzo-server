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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("video")) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only video files allowed"), false);
//   }
// };

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "video/mp4") {
    cb(null, true);
  } else {
    cb(new Error("Only MP4 videos allowed"), false);
  }
}

module.exports = multer({
  storage,
  fileFilter,
});
