const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // abhi bhi rakha hai kyunki controller mein use karenge

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    rewardPoints: {
      type: Number,
      default: 10,
      min: 10,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false, // queries mein password return na ho
    },

    role: {
      type: String,
      enum: ["viewer", "creator", "admin"],
      default: "creator",
    },

    deviceId: {
      type: String,
      unique: true,
      sparse: true, // agar deviceId optional banana ho future mein
    },

    googleId: String, // google login ke liye
    avatar: String,

    trustScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },

    viewedVideos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    // Reward points earned from watching videos
    rewardPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// ← Yeh pre-save hook POORA HATA DIYA gaya
// Ab password hashing controller mein manually karenge

// Password compare method (login ke liye useful rahega)
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
