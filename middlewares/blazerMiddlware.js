// // const multer = require("multer");
// // const b2 = require("../utils/backblaze");

// // // multer memory storage
// // const storage = multer.memoryStorage();
// // const upload = multer({ storage });

// // // middleware
// // const backblazeUpload = [
// //   upload.single("video"),

// //   async (req, res, next) => {
// //     try {
// //       if (!req.file) {
// //         return res
// //           .status(400)
// //           .json({ success: false, message: "No video file uploaded" });
// //       }

// //       // authorize account
// //       await b2.authorize();

// //       // get upload url
// //       const uploadUrlResponse = await b2.getUploadUrl({
// //         bucketId: process.env.B2_BUCKET_ID,
// //       });

// //       const fileName = `videos/${Date.now()}-${req.file.originalname}`;

// //       // upload file
// //       const uploadResponse = await b2.uploadFile({
// //         uploadUrl: uploadUrlResponse.data.uploadUrl,
// //         uploadAuthToken: uploadUrlResponse.data.authorizationToken,
// //         fileName: fileName,
// //         data: req.file.buffer,
// //         mime: req.file.mimetype,
// //       });

// //       // public video url
// //       const videoUrl = `${process.env.B2_BUCKET_URL}/${uploadResponse.data.fileName}`;

// //       // attach url to req for controller
// //       req.videoUrl = videoUrl;

// //       next();
// //     } catch (error) {
// //       console.error("Backblaze Upload Error:", error);
// //       res.status(500).json({
// //         success: false,
// //         message: "Video upload failed",
// //       });
// //     }
// //   },
// // ];

// // module.exports = backblazeUpload;


// const multer = require('multer');
// const B2 = require('backblaze-b2');

// const b2 = new B2({
//   applicationKeyId: process.env.B2_APPLICATION_KEY_ID || "0519de8cf5a7",
//   applicationKey: process.env.B2_APPLICATION_KEY || "0051a76206c37ce65f91b6198cb4557b17d4808516",
// });

// // memory storage → we don't save on disk
// const storage = multer.memoryStorage();

// const upload = multer({
//   storage,
//   limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB limit (you can change)
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('video/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only video files are allowed!'), false);
//     }
//   },
// });

// const uploadToBackblaze = [
//   // 1. multer parses the form-data
//   upload.single('video'),

//   // 2. upload to Backblaze
//   async (req, res, next) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({
//           success: false,
//           message: 'No video file uploaded',
//         });
//       }

//       // Authorize with Backblaze
//       await b2.authorize();

//       // Get upload URL + token
//       const { data: uploadUrlData } = await b2.getUploadUrl({
//         bucketId: process.env.B2_BUCKET_ID,
//       });

//       const fileName = `videos/${Date.now()}-${req.file.originalname}`;

//       // Upload file
//       const { data: uploadFileData } = await b2.uploadFile({
//         uploadUrl: uploadUrlData.uploadUrl,
//         uploadAuthToken: uploadUrlData.authorizationToken,
//         fileName,
//         data: req.file.buffer,
//         mime: req.file.mimetype,
//       });

//       // Final public URL
//       const videoUrl = `${process.env.B2_PUBLIC_BUCKET_URL}/${fileName}`;

//       // Attach to request → so controller can use it
//       req.uploadedVideo = {
//         url: videoUrl,
//         fileName,
//         mimeType: req.file.mimetype,
//         size: req.file.size,
//       };

//       next();
//     } catch (err) {
//       console.error('Backblaze upload error:', err);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to upload video to Backblaze',
//         error: err.message,
//       });
//     }
//   },
// ];

// module.exports = uploadToBackblaze;

const multer = require("multer");
const B2 = require("backblaze-b2");

const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID || "0050519de8cf5a70000000003",
  applicationKey: process.env.B2_APPLICATION_KEY || "K005gGzkagn9W497o2jXz7qlhbxE0Kk",



});

  console.log(
    "Backblaze Keys - ID:",
    process.env.applicationKeyId ? "LOADED" : "MISSING",
    "KEY:",
    process.env.applicationKey ? "LOADED" : "MISSING"
  );
// ================= MULTER =================
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    if (
      file.fieldname === "video" &&
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else if (
      file.fieldname === "thumbnail" &&
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
});

// ================= BACKBLAZE MIDDLEWARE =================
const uploadToBackblaze = [
  // 1️⃣ Parse multipart form
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),

  // 2️⃣ Upload to Backblaze
  async (req, res, next) => {
    try {
      if (!req.files || !req.files.video) {
        return res.status(400).json({
          success: false,
          message: "Video file is required",
        });
      }

      await b2.authorize();

      const { data: uploadUrlData } = await b2.getUploadUrl({
        bucketId: process.env.B2_BUCKET_ID,
      });

      const videoFile = req.files.video[0];
      const fileName = `videos/${Date.now()}-${videoFile.originalname}`;

      await b2.uploadFile({
        uploadUrl: uploadUrlData.uploadUrl,
        uploadAuthToken: uploadUrlData.authorizationToken,
        fileName,
        data: videoFile.buffer,
        mime: videoFile.mimetype,
      });

      const videoUrl = `${process.env.B2_PUBLIC_BUCKET_URL}/${fileName}`;

      // attach for controller
      req.uploadedVideo = {
        url: videoUrl,
        fileName,
        mimeType: videoFile.mimetype,
        size: videoFile.size,
      };

      // thumbnail (optional)
      if (req.files.thumbnail) {
        req.uploadedVideo.thumbnail = req.files.thumbnail[0];
      }

      next();
    } catch (err) {
      console.error("Backblaze upload error:", err);
      return res.status(500).json({
        success: false,
        message: "Backblaze upload failed",
        error: err.message,
      });
    }
  },
];

module.exports = uploadToBackblaze;
