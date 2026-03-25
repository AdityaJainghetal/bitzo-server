const User = require("../../models/admin/AdminModel");
const AllUser = require("../../models/usermodel");
const generateToken = require("../../utils/generateToken");
const bcrypt = require("bcryptjs");


exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Email check
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};



exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const users = await AllUser.find()
      .select("name email role avatar trustScore rewardPoints createdAt")
      .populate({
        path: "channels",
        select: "name channelImage createdAt",
        populate: {
          path: "videos",
          select: "title thumbnail likesCount createdAt",
          options: { limit: 4, sort: { createdAt: -1 } } // latest 4 videos per channel
        }
      })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AllUser.countDocuments();

    res.json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: users,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      role: "admin",
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);

    // 🔥 COOKIE SET KARO
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // production me true
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


