var ICO = artifacts.require("./ICO.sol");

module.exports = function (deployer) {
  deployer.deploy(ICO, "0xC0D335A6296310895E87fcAa31466283f65f43Eb");
};