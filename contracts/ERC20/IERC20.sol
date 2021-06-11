// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.4;

/**
 * @dev Interface of the ERC20 standard
 * This interface contract defines fuctions and events required to meet the ERC20 standard.
 */
interface IERC20 {
    /**
     * @dev returns the total amount of tokens in existence right now, minus any tokens
     * that have been burned.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev returns the number of tokens that `spender` is allowed to spend on behalf of `owner`.
     */
    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    /**
     * @dev transfer `tokens` tokens from `owner` account to `to` account.
     */
    function transfer(address to, uint256 tokens) external returns (bool);

    /**
     * @dev allow `spender` to withdraw `tokens` tokens from the `caller` account.
     */
    function approve(address spender, uint256 tokens) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 tokens
    ) external returns (bool);

    /**
     * @dev emitted when `tokens` tokens are transfered from `from`to `to`.
     */
    event Transfer(address indexed from, address indexed to, uint256 tokens);

    /**
     * @dev emitted when `owner` set the allowance of `spender` to `tokens`.
     */
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 tokens
    );
}
