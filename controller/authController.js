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

const User = require("../models/usermodel");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs"); // ← make sure this is installed

const jwt = require("jsonwebtoken");

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
// exports.loginUser = async (req, res) => {
//   try {
//     const { email, password, deviceId } = req.body;

//     if (!email || !password || !deviceId) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required"
//       });
//     }

//     // 🔑 IMPORTANT FIX HERE
//     const user = await User.findOne({ email }).select("+password");

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials"
//       });
//     }

//     if (!user.password) {
//       return res.status(500).json({
//         success: false,
//         message: "Password not found for this user"
//       });
//     }

//     // Device lock
//     // if (user.deviceId !== deviceId) {
//     //   return res.status(401).json({
//     //     success: false,
//     //     message: "Login blocked: different device detected"
//     //   });
//     // }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token: generateToken(user._id),
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         trustScore: user.trustScore
//       }
//     });

//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Login failed"
//     });
//   }
// };

// exports.loginUser = async (req, res) => {
//   try {
//     const { email, password, deviceId } = req.body;

//     if (!email || !password || !deviceId) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required"
//       });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials"
//       });
//     }

//     // Device lock
//     if (user.deviceId !== deviceId) {
//       return res.status(401).json({
//         success: false,
//         message: "Login blocked: different device detected"
//       });
//     }

//     // 🔐 COMPARE PASSWORD
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token: generateToken(user._id),
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         trustScore: user.trustScore
//       }
//     });
//   } catch (error) {
//     console.error("Login error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Login failed"
//     });
//   }
// };

// exports.loginUser = async (req, res) => {
//   try {
//     const { email, password, deviceId } = req.body;

//     if (!email || !password || !deviceId) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required"
//       });
//     }

//     const user = await User.findOne({ email }).select("+password");
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials"
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials"
//       });
//     }

//     const token = jwt.sign(
//       { userId: user._id },
//       process.env.SECRET_KEY,
//       { expiresIn: "7d" }
//     );

//     // ✅ SET COOKIE
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: false,     // true in production
//       sameSite: "lax"
//     });

//     // ✅ SEND TOKEN ALSO IN RESPONSE
//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token, // 👈 token bhi send ho raha hai
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         trustScore: user.trustScore
//       }
//     });

//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Login failed"
//     });
//   }
// };

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
