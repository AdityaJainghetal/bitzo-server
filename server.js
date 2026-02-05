

require("dotenv").config(); // ✅ MUST BE FIRST LINE

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("node:path");
const mongoose = require("mongoose");
const morgan = require("morgan");
const dns = require("node:dns");

// ---------- DNS ----------
dns.setServers(["8.8.8.8", "1.1.1.1", "0.0.0.0"]);

// ---------- Routes ----------
const authRoutes = require("./routes/authRoute.js");
const adminRoute = require("./routes/AdminRoute/AdminRoute.js");
const videoRoutes = require("./routes/VideoRoutes.js");
const userRoutes = require("./routes/userVideoRoute.js");
const categoryRouter = require("./routes/categoryRoute/category.route.js");

const app = express();
const PORT = process.env.PORT || 8000;
morgan.token("body", (req) => JSON.stringify(req.body));
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"));

// ---------- MongoDB ----------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// ---------- Middlewares ----------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ---------- Static ----------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------- Routes ----------
app.use("/api", authRoutes);
app.use("/api/category", categoryRouter);
app.use("/api/admin", adminRoute);
app.use("/api/adminvideo", videoRoutes);
app.use("/api/uservideo", userRoutes);

// ---------- Health ----------
app.get("/", (req, res) => {
  res.send("🚀 Server is running successfully");
});

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ---------- Error ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// ---------- Listen ----------
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
