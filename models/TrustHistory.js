const mongoose = require("mongoose");

const trustHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    score: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrustHistory", trustHistorySchema);
