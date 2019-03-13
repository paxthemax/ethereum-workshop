const BN = require("bn.js");
const axios = require("axios");

const GAS_STATION_URL = "https://ethgasstation.info/json/ethgasAPI.json";

const myFetch = async (url) => {
  const res = await axios.get(url);
  return res.data;
}

const ten8 = new BN(10).pow(new BN(8));
const toWei = gasRes => new BN(gasRes, 10).mul(ten8).toString();

// flatGas returns a fake api response with same gas for all types
const flatGas = price => new Promise(resolve => resolve({low: price, mid: price, high: price}));

const getMainnetGasPrice = async () => {
  const res = await myFetch(GAS_STATION_URL);
  return {
    low: toWei(res.safeLow),
    mid: toWei(res.average),
    high: toWei(res.fast),
  }
}

const getGasPriceForNetwork = (network) => {
  if (network === "mainnet") {
    return getMainnetGasPrice();
  }
  if (["ropsten", "rinkeby", "kovan"].includes(network)) {
    // 100 GWei
    return flatGas(toWei("1000"));
  }
  if (network === "development") {
    return flatGas(toWei("20"));
  }
  return new Promise((_, reject) => reject(`invalid network: ${network}`));
}

module.exports = {
  getMainnetGasPrice,
  getGasPriceForNetwork,
}
