const Ether = artifacts.require("./AtomicSwapEther.sol");
const ERC20 = artifacts.require("./AtomicSwapERC20.sol");
const TestERC20 = artifacts.require("./TestERC20.sol");
const Test2ERC20 = artifacts.require("./Test2ERC20.sol");

module.exports = function (deployer) {
  deployer.deploy(Ether);
  deployer.deploy(ERC20);
  deployer.deploy(TestERC20);
  deployer.deploy(Test2ERC20);
};
