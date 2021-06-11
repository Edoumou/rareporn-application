// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

abstract contract Owned {
    address internal owner = msg.sender;

    event NewOwner(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner {
        require(msg.sender == owner, "Owned: caller is not the owner");
        _;
    }

    function transferOwnership(address _newOwner) public onlyOwner {
        require(
            _newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        emit NewOwner(owner, _newOwner);
        owner = _newOwner;
    }

    function renounceOwnership() public onlyOwner {
        emit NewOwner(owner, address(0));
        owner = address(0);
    }
}
