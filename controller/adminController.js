const User = require("../models/User");
const WatchLog = require("../models/WatchLog");

exports.getFraudDashboard = async (req, res) => {
  try {
    const users = await User.find().select("name email trustScore role");

    const lowTrustUsers = users.filter(u => u.trustScore < 30);

    const suspicious = await WatchLog.aggregate([
      {
        $group: {
          _id: "$user",
          total: { $sum: 1 }
        }
      },
      { $match: { total: { $gt: 200 } } }
    ]);

    res.status(200).json({
      totalUsers: users.length,
      lowTrustUsers,
      suspiciousActivityUsers: suspicious.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
