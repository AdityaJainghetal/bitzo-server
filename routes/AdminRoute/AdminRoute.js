const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getAllUsers
} = require("../../controller/AdminController/AdminController");

// Admin Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/alluser",getAllUsers)

module.exports = router;
