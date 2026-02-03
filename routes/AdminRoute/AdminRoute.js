const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser
} = require("../../controller/AdminController/AdminController");

// Admin Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
