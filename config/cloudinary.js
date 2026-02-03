const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dgc7ltpg8",
  api_key: process.env.CLOUDINARY_API_KEY || "917265695125899",
  api_secret: process.env.CLOUDINARY_API_SECRET || "gn8cI1Qmz7saWEYXfZfQ8zo9Mcw",
});

module.exports = cloudinary;
