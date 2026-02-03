// // // import jwt from "jsonwebtoken";
// // const jwt = require("jsonwebtoken");
// // const isAuthenticated = async (req, res, next) => {
// //   try {
// //     const token = req.cookies.token;
// //     if (!token) {
// //       return res.status(401).json({
// //         message: "User not authenticated",
// //         success: false,
// //       });
// //     }
// //     const decode = await jwt.verify(token, process.env.SECRET_KEY);
// //     if (!decode) {
// //       return res.status(401).json({
// //         message: "Invalid token",
// //         success: false,
// //       });
// //     }
// //     req.user = { _id: decode.userId };
// //     req.userId = decode.userId;
// //     next();
// //   } catch (error) {
// //     console.error(error);
// //     return res.status(401).json({
// //       message: "User not authenticated",
// //       success: false,
// //     });
// //   }
// // };
// // // export default isAuthenticated;
// // module.exports = isAuthenticated;


// const jwt = require("jsonwebtoken");

// const isAuthenticated = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized - No token"
//       });
//     }

//     const token = authHeader.split(" ")[1];

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorized - Invalid token"
//     });
//   }
// };

// module.exports = isAuthenticated;


const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid or expired token"
    });
  }
};

module.exports = isAuthenticated;