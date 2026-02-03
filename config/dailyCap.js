const DailyEarning = require("../models/DailyEarning");

exports.canEarnToday = async (user, amount) => {
  const today = new Date().toISOString().slice(0, 10);

  const cap = user.role === "creator" ? 100 : 50;

  let record = await DailyEarning.findOne({ user: user._id, date: today });

  if (!record) {
    record = await DailyEarning.create({
      user: user._id,
      date: today,
      earned: 0
    });
  }

  if (record.earned >= cap) return false;

  record.earned += amount;
  if (record.earned > cap) record.earned = cap;

  await record.save();
  return true;
};
