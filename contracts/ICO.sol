// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./ERC20/ERC20.sol";
import "./ERC20/Owned.sol";

contract ICO is ERC20("Rare Platform Token", "RPT"), Owned {
    ERC20 public token;

    uint256 private initialSupply = 500000 ether; // 1 eth = 10^(18) => decimals = 18
    uint256 public rateOfChange = 1000;
    uint256 public raisedAmount;
    uint256 private minInvestment;
    uint256 private maxInvestment;
    address[] listOfInvestors;
    address payable public depositETHAddress;

    mapping(address => bool) public investors;

    event State(address _address);

    constructor(address payable _depositETHAddress) {
        token = new ERC20("Rare Platform Token", "RPT");

        depositETHAddress = _depositETHAddress;
        mint(msg.sender, initialSupply);

        minInvestment = 0.01 ether;
        maxInvestment = 10 ether;
    }

    function buyToken() public payable {
        // get the owner address (the one used to deploy the contract)
        address ownerAddress = owner;

        // prevent the contract address to buy tokens
        require(
            msg.sender != ownerAddress,
            "ICO: buy token with contract address"
        );

        // require enough eth to buy tokens
        require(
            msg.value != 0 && msg.value < msg.sender.balance,
            "ICO: not enough eth"
        );

        // prevent buying tokens after all tokens have been sold out.
        require(raisedAmount + msg.value <= initialSupply, "ICO is over");

        // the amount to invest must be in range [minInvestment, maxInvestment]
        require(
            msg.value >= minInvestment && msg.value <= maxInvestment,
            "ICO: change amount"
        );

        // update state variables before calling external function (security).
        // Register the user only if buying the first time
        raisedAmount = add(raisedAmount, msg.value);

        if (!investors[msg.sender]) {
            listOfInvestors.push(msg.sender);
            investors[msg.sender] = true;
        }

        // amount of tokens to buy
        uint256 tokens = msg.value * rateOfChange;

        // send eth to the deposit account of the contract owner,
        // not to the contract address
        depositETHAddress.transfer(msg.value);

        // transfer tokens to the buyer
        _transfer(ownerAddress, msg.sender, tokens);
    }

    receive() external payable {
        emit State(msg.sender);
    }

    fallback() external payable {
        buyToken();
    }

    function getListOfUsers() public view returns (address[] memory) {
        return listOfInvestors;
    }

    function getOwnerAddress() public view returns (address) {
        return owner;
    }
}
