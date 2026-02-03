const mongoose = require("mongoose");

const dailyEarningSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: {
      type: String,
      required: true // YYYY-MM-DD
    },
    earned: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

dailyEarningSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyEarning", dailyEarningSchema);
