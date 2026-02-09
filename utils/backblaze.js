const B2 = require("backblaze-b2");

const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
});

console.log(
  "KEY_ID:",
  process.env.B2_APPLICATION_KEY_ID,
  "KEY:",
  process.env.B2_APPLICATION_KEY ? "LOADED" : "MISSING"
);

module.exports = b2;