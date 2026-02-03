const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { logWatch } = require("../controllers/watchController");

router.post("/log", auth, logWatch);

module.exports = router;
