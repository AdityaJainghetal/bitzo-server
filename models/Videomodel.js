// const mongoose = require("mongoose");

// const videoSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true
//     },

//     description: {
//       type: String
//     },

//     videoUrl: {
//       type: String,
//       required: true
//     },

//     type: {
//       type: String,
//       enum: ["short", "long","reel"],
//       required: true
//     },

//     duration: {
//       type: Number
//     },

//     views: {
//       type: Number,
//       default: 0
//     },

//     creator: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       // required: true
//     }
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Video", videoSchema);


// const mongoose = require("mongoose");

// const videoSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true
//     },

//     description: {
//       type: String
//     },

//     videoUrl: {
//       type: String,
//       required: true
//     },

//     type: {
//       type: String,
//       enum: ["short", "long", "reel"],
//       required: true
//     },

//     duration: {
//       type: Number
//     },

//     views: {
//       type: Number,
//       default: 0
//     },

//     likes: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User"
//       }
//     ],

//     dislikes: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User"
//       }
//     ],

//     creator: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User"
//     },

//     thumbnail: {
//       type: String
//     },

//     audio: {
//       type: String
//     }
//   },
//   { timestamps: true }
// );

// // Virtual field for likes count
// videoSchema.virtual("likesCount").get(function() {
//   return this.likes ? this.likes.length : 0;
// });

// // Virtual field for dislikes count
// videoSchema.virtual("dislikesCount").get(function() {
//   return this.dislikes ? this.dislikes.length : 0;
// });

// // Ensure virtuals are included in JSON
// videoSchema.set("toJSON", { virtuals: true });
// videoSchema.set("toObject", { virtuals: true });

// module.exports = mongoose.model("Video", videoSchema);

const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    videoUrl: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["short", "long", "reel"],
      required: true,
    },

    duration: {
      type: Number,
    },

    views: {
      type: Number,
      default: 0,
    },

    // ✅ PUBLIC COUNTS (NO USER)
    likesCount: {
      type: Number,
      default: 0,
    },

    dislikesCount: {
      type: Number,
      default: 0,
    },

    // ✅ ANONYMOUS COMMENTS
    comments: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Optional (if admin uploads)
    creatorName: {
      type: String,
    },

    thumbnail: {
      type: String,
    },

    audio: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);
