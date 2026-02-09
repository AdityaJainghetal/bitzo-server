const backblaze = require("backblaze-b2");
const b2 = new backblaze({
  applicationKeyId: process.env.B2_KEY_ID,
  applicationKey: process.env.B2_APP_KEY,
});

module.exports = b2;
