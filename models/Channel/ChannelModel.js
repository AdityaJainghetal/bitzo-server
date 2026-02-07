


const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  

    channeldescription: {
      type: String,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    channelImage: {
      type: String,
      default: "",
    },

    channelBanner: {
      type: String,
      default: "",
    },

    contactemail: {
      type: String,
      lowercase: true,
      trim: true,
    },

    videoUrl: {
      type: String,
      default: "",
    },
    Videoname:{
      type: String,
      default: "",
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    thumbnail: {
      type: String,
      default: "",
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Channel", channelSchema);
