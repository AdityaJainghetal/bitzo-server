// const WatchLog = require("../models/WatchLog");
// const User = require("../models/usermodel");

// /**
//  * TRUST SCORE RANGE: 0 – 100
//  * 100 = Very trusted
//  * 0 = Fraud / Bot
//  */

// const MAX_SCORE = 100;
// const MIN_SCORE = 0;

// exports.calculateTrustScore = async (userId) => {
//   // Fetch recent watch logs (last 7 days)
//   const logs = await WatchLog.find({
//     user: userId,
//     createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
//   });

//   let score = MAX_SCORE;

//   // 1️⃣ Very low activity (new / inactive user)
//   if (logs.length < 3) {
//     score -= 10;
//   }

//   // 2️⃣ Excessive watch actions (bot-like behavior)
//   if (logs.length > 200) {
//     score -= 25;
//   }

//   // 3️⃣ Very fast skips (watchTime < 5s)
//   const fastSkips = logs.filter(log => log.watchTime < 5).length;
//   if (fastSkips > 10) {
//     score -= 20;
//   }
//   if (fastSkips > 30) {
//     score -= 30;
//   }

//   // 4️⃣ Repeated watching of same video
//   const videoWatchCount = {};
//   logs.forEach(log => {
//     const id = log.video.toString();
//     videoWatchCount[id] = (videoWatchCount[id] || 0) + 1;
//   });

//   Object.values(videoWatchCount).forEach(count => {
//     if (count > 3) score -= 5;
//     if (count > 5) score -= 10;
//     if (count > 10) score -= 20;
//   });

//   // 5️⃣ Completion ratio (healthy behavior)
//   const completedCount = logs.filter(l => l.completed).length;
//   const completionRatio =
//     logs.length > 0 ? completedCount / logs.length : 0;

//   if (completionRatio > 0.6) score += 5;
//   if (completionRatio < 0.2) score -= 15;

//   // 6️⃣ IP hopping detection
//   const uniqueIPs = new Set(logs.map(l => l.ip));
//   if (uniqueIPs.size > 5) score -= 15;
//   if (uniqueIPs.size > 10) score -= 25;

//   // 7️⃣ Device consistency
//   const uniqueDevices = new Set(logs.map(l => l.deviceId));
//   if (uniqueDevices.size > 1) {
//     score -= 30; // device rule broken
//   }

//   // 8️⃣ Clamp score
//   if (score > MAX_SCORE) score = MAX_SCORE;
//   if (score < MIN_SCORE) score = MIN_SCORE;

//   // 9️⃣ Persist score to User
//   await User.findByIdAndUpdate(userId, {
//     trustScore: score
//   });

//   return score;
// };

// /**
//  * QUICK CHECK (used before payouts)
//  */
// exports.isTrustedForPayout = (trustScore) => {
//   return trustScore >= 30;
// };

const WatchLog = require("../models/WatchLog");
const User = require("../models/usermodel");

exports.calculateTrustScore = async (userId) => {
  const logs = await WatchLog.find({ user: userId });

  let score = 100;

  if (logs.length > 100) score -= 20;

  const repeatVideos = {};
  logs.forEach(log => {
    repeatVideos[log.video] = (repeatVideos[log.video] || 0) + 1;
  });

  Object.values(repeatVideos).forEach(count => {
    if (count > 5) score -= 10;
  });

  const fastActions = logs.filter(l => l.watchTime < 5).length;
  if (fastActions > 10) score -= 20;

  score = Math.max(score, 0);

  await User.findByIdAndUpdate(userId, { trustScore: score });

  return score;
};
