// // import mongoose from "mongoose";
// const mongoose = require("mongoose");
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("✅ MongoDB Connected Successfully");
//   } catch (err) {
//     console.error("❌ MongoDB connection failed:", err.message);
//     process.exit(1);
//   }
// };

// // export default connectDB;
// module.exports = connectDB;



// database/db.js
// import mongoose from "mongoose";



const mongoose = require("mongoose");

const connectDB = async () => {
  try {
//     await mongoose.connect(process.env.MONGO_URI, {
//   serverSelectionTimeoutMS: 5000,   // test ke liye kam rakho
//   socketTimeoutMS: 45000,
//   family: 4,                        // IPv4 force karo
// } );

await mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 30000,
  family: 4,
  heartbeatFrequencyMS: 10000,  // extra
});
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

// export default connectDB;
module.exports = connectDB;

