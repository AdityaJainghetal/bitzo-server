// const express = require("express");
// const router = express.Router();
// const authMiddleware = require("../middlewares/isAuthenticated");
// const { registerUser, loginUser } = require("../controller/authController");
// const { OAuth2Client } = require('google-auth-library');
// const jwt = require('jsonwebtoken');

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "1043684646784-d9igjhng2cfdp006ogsi0am1i3d4djh1.apps.googleusercontent.com");
// const User = require("../models/usermodel");
// router.post("/register", registerUser);
// router.post("/login", loginUser);
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { session: false }),
//   (req, res) => {
//     const token = jwt.sign(
//       { id: req.user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.redirect(`http://localhost:5173/login-success?token=${token}`);
//   }
// );

// router.post('/auth/google', async (req, res) => {
//   const { credential, deviceId } = req.body;

//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: credential,
//       audience: process.env.GOOGLE_CLIENT_ID || "1043684646784-d9igjhng2cfdp006ogsi0am1i3d4djh1.apps.googleusercontent.com",
//     });

//     const payload = ticket.getPayload();
//     const { email, name, picture, sub: googleId } = payload;

//     // Find or create user (your logic)
//     let user = await User.findOne({ email });
//     if (!user) {
//       user = await User.create({
//         name: name || email.split('@')[0],
//         email,
//         googleId,
//         picture,
//         // password: null or random – since it's OAuth
//       });
//     }

//     // Issue your own JWT (same as email/password flow)
//     const token = jwt.sign(
//       { id: user._id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
//   } catch (error) {
//     console.error(error);
//     res.status(401).json({ message: 'Invalid Google token' });
//   }
// });

// router.get("/profile", authMiddleware, async (req, res) => {
//   try {
//     // req.user JWT middleware se aata hai
//     const userId = req.user._id || req.user.userId || req.user.id;

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "User ID not found in token",
//       });
//     }

//     const user = await User.findById(userId)
//       .select(
//         "username email fullName profilePicture bio rewardPoints createdAt lastLogin"
//       )
//       .lean();

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       user: {
//         ...user,
//         joinedAt: user.createdAt
//           ? new Date(user.createdAt).toLocaleDateString()
//           : null,
//       },
//     });
//   } catch (error) {
//     console.error("Error in getProfile:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while fetching profile",
//     });
//   }
// });


// module.exports = router;


const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/usermodel");
const authMiddleware = require("../middlewares/isAuthenticated");
const { registerUser, loginUser } = require("../controller/authController");

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "1043684646784-d9igjhng2cfdp006ogsi0am1i3d4djh1.apps.googleusercontent.com";

const client = new OAuth2Client(GOOGLE_CLIENT_ID);


router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/auth/google", async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: "Google credential missing" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        googleId,
        picture,
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(401).json({ message: "Invalid Google token" });
  }
});

/* =======================
   USER PROFILE (JWT)
======================= */
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId)
      .select("name email picture bio createdAt lastLogin")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        joinedAt: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString()
          : null,
      },
    });
  } catch (error) {
    console.error("Profile Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
