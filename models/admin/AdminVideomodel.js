const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    videoUrl: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ["short", "long"],
      required: true
    },

    duration: {
      type: Number
    },

    views: {
      type: Number,
      default: 0
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("VideoAdmin", videoSchema);
