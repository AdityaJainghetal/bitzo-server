const WatchLog = require("../models/WatchLog");
const Video = require("../models/Videomodelo");
const { calculateTrustScore } = require("../config/trustScore");
const { addEarnings } = require("./WalletControlller");

exports.logWatch = async (req, res) => {
  try {
    const { videoId, watchTime } = req.body;

    const video = await Video.findById(videoId).populate("creator");
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const completed = watchTime >= (video.duration * 0.8);

    await WatchLog.create({
      user: req.user._id,
      video: videoId,
      watchTime,
      completed,
      ip: req.ip,
      deviceId: req.user.deviceId
    });

    video.views += 1;
    await video.save();

    const trustScore = await calculateTrustScore(req.user._id);

    if (trustScore >= 30) {
      const baseReward = video.type === "long" ? 0.30 : 0.10;
      const reward = baseReward * (trustScore / 100);

      await addEarnings(req.user._id, reward);
      await addEarnings(video.creator._id, reward * 2);
    }

    res.status(200).json({
      success: true,
      message: "Watch logged",
      trustScore
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
