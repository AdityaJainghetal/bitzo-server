const axios = require("axios");

const PROXYCHECK_API = process.env.PROXYCHECK_API_KEY;

exports.isVPN = async (ip) => {
  try {
    const url = `https://proxycheck.io/v2/${ip}?key=${PROXYCHECK_API}&vpn=1&asn=1`;
    const { data } = await axios.get(url);

    if (!data[ip]) return false;
    return data[ip].proxy === "yes";
  } catch (error) {
    return false;
  }
};
