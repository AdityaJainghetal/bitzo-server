const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getFraudDashboard } = require("../controllers/adminController");

router.get("/fraud-dashboard", auth, getFraudDashboard);

module.exports = router;
