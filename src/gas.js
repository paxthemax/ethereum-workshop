const BN = require("bn.js");
const axios = require("axios");

const GAS_STATION_URL = "https://ethgasstation.info/json/ethgasAPI.json";

const myFetch = async (url) => {
  const res = await axios.get(url);
  return res.data;
}

const ten8 = new BN(10).pow(new BN(8));
const toWei = gasRes => new BN(gasRes, 10).mul(ten8).toString();

const getGasPrice = async () => {
  const res = await myFetch(GAS_STATION_URL);
  return {
    low: toWei(res.safeLow),
    mid: toWei(res.average),
    high: toWei(res.fast),
  }
}

module.exports = {
  getGasPrice
}
