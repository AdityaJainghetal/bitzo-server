const mongoose = require("mongoose");

const watchLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video"
    },

    watchTime: {
      type: Number
    },

    completed: {
      type: Boolean,
      default: false
    },

    ip: String,
    deviceId: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("WatchLog", watchLogSchema);
