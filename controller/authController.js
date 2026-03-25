const User = require("../models/usermodel");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs"); // ← make sure this is installed
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const imagekit = require("../utils/imagekit.js");
const path = require("path");
exports.loginUser = async (req, res) => {
  try {
    const { email, password, deviceId } = req.body;
    if (!email || !password || !deviceId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    if (user.deviceId !== deviceId) {
      return res.status(401).json({
        success: false,
        message: "Login blocked: different device detected",
      });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const token = require("../utils/generateToken")(user._id);
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        token: user.token,
        role: user.role,
        trustScore: user.trustScore,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

/* ===================== REGISTER ===================== */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, deviceId } = req.body;

    if (!name || !email || !password || !deviceId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Device lock
    const deviceExists = await User.findOne({ deviceId });
    if (deviceExists) {
      return res.status(400).json({
        success: false,
        message: "This device is already registered",
      });
    }

    // Email check
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // 🔐 HASH PASSWORD IN CONTROLLER
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      deviceId,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        trustScore: user.trustScore,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password, deviceId } = req.body;

    // 1️⃣ Validate input
    if (!email || !password || !deviceId) {
      return res.status(400).json({
        success: false,
        message: "Email, password and deviceId are required",
      });
    }

    // 2️⃣ Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4️⃣ Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY, // 🔴 MUST exist in .env
      { expiresIn: "7d" },
    );

    // 5️⃣ Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ✅ prod safe
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 6️⃣ Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token, // optional (frontend header use ke liye)
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token,
        trustScore: user.trustScore,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.AllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("❌ Fetch users error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getUserDetail = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .populate("channels", "name description")
      .populate("videos", "title thumbnail views")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("getUserDetail Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("channels", "name")
      .populate("videos", "title")
      .select("-password");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(req.body.oldPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.UserEdit = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID format" });
    }

    const user = await User.findById(userId).select(
      "+avatar +avatarFileId +name +email",
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const updateData = {};
    const oldAvatarFileId = user.avatarFileId;

    // ====================== AVATAR ======================
    if (req.file) {
      const file = req.file;

      if (!file.mimetype?.startsWith("image/")) {
        return res
          .status(400)
          .json({ success: false, message: "Only image files are allowed" });
      }
      if (file.size > 5 * 1024 * 1024) {
        return res
          .status(400)
          .json({ success: false, message: "Image must be less than 5MB" });
      }

      const fileExt = path.extname(file.originalname || ".jpg").toLowerCase();
      const fileName = `avatar_${user._id}_${Date.now()}${fileExt}`;

      const uploadResponse = await imagekit.upload({
        file: file.buffer,
        fileName,
        folder: "/avatars",
        useUniqueFileName: true,
      });

      updateData.avatar = uploadResponse.url;
      updateData.avatarFileId = uploadResponse.fileId; // ← Ye important hai
    }

    // ====================== NAME ======================
    if (req.body?.name !== undefined) {
      const trimmedName = String(req.body.name).trim();

      if (!trimmedName) {
        return res
          .status(400)
          .json({ success: false, message: "Name cannot be empty" });
      }
      if (trimmedName.length < 2 || trimmedName.length > 50) {
        return res.status(400).json({
          success: false,
          message: "Name must be 2-50 characters long",
        });
      }
      if (trimmedName !== user.name) {
        updateData.name = trimmedName;
      }
    }

    // ====================== EMAIL ======================
    if (req.body?.email !== undefined) {
      const newEmail = String(req.body.email).trim().toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid email format" });
      }

      if (newEmail !== user.email) {
        const emailExists = await User.findOne({ email: newEmail }).lean();
        if (emailExists) {
          return res
            .status(409)
            .json({ success: false, message: "Email already in use" });
        }
        updateData.email = newEmail;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({
        success: true,
        message: "No changes provided",
        user: user.toObject({ versionKey: false }),
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true },
    )
      .select(
        "-password -__v -googleId -deviceId -createdAt -updatedAt -avatarFileId",
      )
      .lean();

    // ====================== DELETE OLD AVATAR (Non-blocking) ======================
    if (updateData.avatar && oldAvatarFileId) {
      (async () => {
        try {
          await imagekit.deleteFile(oldAvatarFileId);
          console.log(`Old avatar deleted: ${oldAvatarFileId}`);
        } catch (err) {
          console.warn(
            "[Non-critical] Failed to delete old avatar:",
            err.message,
          );
        }
      })();
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UserEdit error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      ...(process.env.NODE_ENV === "development" && { debug: error.message }),
    });
  }
};
// exports.UserEdit = async (req, res) => {
//   try {
//     const userId = req.params.id;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ success: false, message: "Invalid user ID format" });
//     }

//     const user = await User.findById(userId).select('+avatar +name +email');
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     const updateData = {};
//     let oldAvatarUrl = user.avatar;

//     // Avatar
//     if (req.files?.avatar) {
//       const file = req.files.avatar;

//       if (!file.mimetype?.startsWith('image/')) {
//         return res.status(400).json({ success: false, message: "Only image files allowed" });
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         return res.status(400).json({ success: false, message: "Image too large (max 5MB)" });
//       }

//       const fileName = `avatar_${user._id.toString()}_${Date.now()}${path.extname(file.name || '.jpg')}`;

//       const uploadResponse = await imagekit.upload({
//         file: file.data,
//         fileName,
//         folder: "/avatars",
//         useUniqueFileName: true,
//       });

//       updateData.avatar = uploadResponse.url;
//     }

//     // Name
//     if (req.body?.name && typeof req.body.name === 'string') {
//       const trimmed = req.body.name.trim();
//       if (trimmed.length >= 2 && trimmed.length <= 50) {
//         if (trimmed !== user.name) updateData.name = trimmed;
//       } else if (trimmed) {
//         return res.status(400).json({ success: false, message: "Name must be 2–50 characters" });
//       }
//     }

//     // Email
//     if (req.body?.email && typeof req.body.email === 'string') {
//       const email = req.body.email.trim().toLowerCase();
//       if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//         return res.status(400).json({ success: false, message: "Invalid email format" });
//       }
//       if (email !== user.email) {
//         const exists = await User.findOne({ email }).lean();
//         if (exists) {
//           return res.status(409).json({ success: false, message: "Email already in use" });
//         }
//         updateData.email = email;
//       }
//     }

//     if (Object.keys(updateData).length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: "No changes provided",
//         user: user.toObject({ versionKey: false }),
//       });
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     ).select('-password -__v -googleId -deviceId -createdAt -updatedAt').lean();

//     // Clean up old avatar (non-blocking)
//     if (updateData.avatar && oldAvatarUrl && oldAvatarUrl.includes('imagekit.io')) {
//       (async () => {
//         try {
//           const filePath = oldAvatarUrl.split('/').slice(3).join('/').split('?')[0];
//           await imagekit.deleteFile(filePath);
//         } catch (e) {
//           console.warn("[non-critical] Failed to delete old avatar:", e.message);
//         }
//       })();
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Profile updated successfully",
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error("UserEdit error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update profile",
//       ...(process.env.NODE_ENV === 'development' && { debug: error.message }),
//     });
//   }
// };

// exports.UserEdit = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ success: false, message: "Invalid user ID" });
//     }

//     console.log(userId,"userId userId")

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     const updateData = {};

//     // ── 1. Handle avatar upload ───────────────────────────────────────
//     let newAvatarUrl = null;
//     if (req.files?.avatar) {
//       const file = req.files.avatar;

//       if (!file.mimetype?.startsWith("image/")) {
//         return res.status(400).json({ success: false, message: "Only image files allowed" });
//       }

//       // Optional: size limit (e.g. 5MB)
//       if (file.size > 5 * 1024 * 1024) {
//         return res.status(400).json({ success: false, message: "Image too large (max 5MB)" });
//       }

//       const uploadResponse = await imagekit.upload({
//         file: file.data,               // ← Buffer is preferred
//         fileName: `avatar_${user._id}_${Date.now()}${file.name ? path.extname(file.name) : ".jpg"}`,
//         folder: "/avatars",
//       });

//       newAvatarUrl = uploadResponse.url;
//       updateData.avatar = newAvatarUrl;
//     }

//     // ── 2. Name ────────────────────────────────────────────────────────
//     if (req.body?.name && typeof req.body.name === "string") {
//       const name = req.body.name.trim();
//       if (name.length >= 2 && name.length <= 50) {
//         updateData.name = name;
//       }
//     }

//     // ── 3. Email + uniqueness check ───────────────────────────────────
//     if (req.body?.email && typeof req.body.email === "string") {
//       const email = req.body.email.trim().toLowerCase();
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//       if (!emailRegex.test(email)) {
//         return res.status(400).json({ success: false, message: "Invalid email format" });
//       }

//       if (email !== user.email) {
//         const emailExists = await User.findOne({ email });
//         if (emailExists) {
//           return res.status(409).json({ success: false, message: "Email already in use" });
//         }
//         updateData.email = email;
//       }
//     }

//     if (Object.keys(updateData).length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: "No changes to apply",
//         user: user.toProfileJSON(), // optional helper
//       });
//     }

//     const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
//       new: true,
//       runValidators: true,
//     }).select("-password -__v");

//     // Optional: delete old avatar from ImageKit
//     if (newAvatarUrl && user.avatar && user.avatar.includes("imagekit")) {
//       try {
//         const oldFileId = user.avatar.split("/").pop().split("?")[0];
//         await imagekit.deleteFile(oldFileId);
//       } catch (e) {
//         console.warn("Failed to delete old avatar:", e);
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Profile updated successfully",
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error("UserEdit error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while updating profile",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };
