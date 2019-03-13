const BN = require("bn.js");

const GAS_STATION_URL = "https://ethgasstation.info/json/ethgasAPI.json";

const myFetch = async (url, errMsg) => {
  const response = await fetch(url);
  if (!response.ok) {
    return Promise.reject(new Error(errMsg));
  }
  return Promise.resolve(response.json());
}

const ten8 = new BN(10).pow(new BN(8));
const toWei = gasRes => new BN(gasRes, 10).mul(ten8).toString();

const getGasPrice = async () => {
  const res = await myFetch(GAS_STATION_URL, "gas station closed");
  return {
    low: toWei(res.safeLow),
    mid: toWei(res.average),
    high: toWei(res.fast),
  }
}

module.exports = {
  getGasPrice
}
