const Wallet = require("../models/WalletModel");

exports.getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id });
    }

    res.status(200).json({
      success: true,
      wallet
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addEarnings = async (userId, amount) => {
  let wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    wallet = await Wallet.create({ user: userId });
  }

  wallet.balance += amount;
  wallet.totalEarned += amount;
  await wallet.save();
};


