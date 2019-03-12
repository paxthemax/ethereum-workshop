const Migrations = artifacts.require("./common/Migrations.sol");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
