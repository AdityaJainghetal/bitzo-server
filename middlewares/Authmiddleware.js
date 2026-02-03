
const jwt = require("jsonwebtoken");
const isAuthenticated = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No authorization header found"
      });
    }
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid authorization format (use Bearer token)"
      });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Token is missing"
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Token has expired. Please login again."
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid token signature"
      });
    }
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Authentication failed"
    });
  }
};
module.exports = isAuthenticated;