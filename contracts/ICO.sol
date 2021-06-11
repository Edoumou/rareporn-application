// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./ERC20/ERC20.sol";
import "./ERC20/Owned.sol";

contract ICO is ERC20("Rare Platform Token", "RPT"), Owned {
    ERC20 public token;

    uint256 private totalSupply_ = 5000 ether;
    uint256 public rateOfChange = 1000;
    uint256 public raisedAmount;
    uint256 private minInvestment;
    uint256 private maxInvestment;
    uint256 public nbOfInvestors;
    address payable private depositETHAddress;

    mapping(address => bool) investors;

    event State(address _address);

    constructor(address payable _depositETHAddress) {
        token = new ERC20("Rare Platform Token", "RPT");

        depositETHAddress = _depositETHAddress;
        mint(msg.sender, totalSupply_);

        minInvestment = 0.01 ether;
        maxInvestment = 10 ether;
    }
}
