const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const dns = require("dns");

const authRoutes = require("./routes/authRoute.js");
const adminRoute = require("./routes/AdminRoute/AdminRoute.js");
const videoRoutes = require("./routes/VideoRoutes.js");
const userRoutes = require("./routes/userVideoRoute.js");

dns.setServers(["8.8.8.8", "1.1.1.1" , "0.0.0.0"]);

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// ---------- MongoDB Direct Connection ----------
mongoose
  .connect( process.env.MONGO_URI || "mongodb+srv://adityajainghetal_db_user:Adityaa@cluster0.5p8i3is.mongodb.net/?appName=Cluster0")
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// ---------- Middlewares ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------- CORS ----------

  app.use(cors({
  origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------- Routes ----------
app.use("/api", authRoutes);
app.use("/api/admin", adminRoute);
app.use("/adminvideo", videoRoutes);
app.use("/api/uservideo", userRoutes);

// ---------- Health Check ----------
app.get("/", (req, res) => {
  res.send("🚀 Server is running successfully");
});

// ---------- 404 Handler ----------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ---------- Error Handler ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ---------- Server Listen ----------
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
