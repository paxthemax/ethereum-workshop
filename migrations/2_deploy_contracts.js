const IOEToken = artifacts.require("./IOEToken.sol");

module.exports = function(deployer) {
  const cap = 1000 * 1e9;
  const name = "Test Tokens";
  const symbol = "TST";
  const decimals = 14;
  deployer.deploy(IOEToken, cap, name, symbol, decimals);
};
