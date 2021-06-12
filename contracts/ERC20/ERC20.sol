// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./IERC20.sol";
import "./SafeMath.sol";

contract ERC20 is IERC20, SafeMath {
    mapping(address => uint256) internal balances;
    mapping(address => mapping(address => uint256)) internal allowances;
    uint256 private _totalSupply;

    string public name;
    string public symbol;

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }

    function decimals() public pure returns (uint8) {
        return 18;
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address _account)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return balances[_account];
    }

    function allowance(address _owner, address _spender)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return allowances[_owner][_spender];
    }

    function transfer(address _to, uint256 _tokens)
        public
        virtual
        override
        returns (bool)
    {
        _transfer(msg.sender, _to, _tokens);
        return true;
    }

    function approve(address _spender, uint256 _tokens)
        public
        virtual
        override
        returns (bool)
    {
        require(
            msg.sender != address(0),
            "ERC20: approve from the zero address"
        );
        require(_spender != address(0), "ERC20: approve to the zero address");

        allowances[msg.sender][_spender] = _tokens;
        emit Approval(msg.sender, _spender, _tokens);

        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _tokens
    ) public virtual override returns (bool) {
        uint256 _allowance = allowances[_from][msg.sender];
        require(_allowance >= _tokens);

        _transfer(_from, _to, _tokens);

        return true;
    }

    function _transfer(
        address _from,
        address _to,
        uint256 _tokens
    ) internal virtual {
        require(_from != address(0), "ERC20: transfer from the zero address");
        require(_to != address(0), "ERC20: transfer to the zero address");

        uint256 senderBalance = balances[_from];
        require(
            senderBalance >= _tokens,
            "ERC20: transfer amount exceeds balance"
        );

        balances[_from] -= _tokens;
        balances[_to] += _tokens;
        emit Transfer(_from, _to, _tokens);
    }

    function mint(address _account, uint256 _tokens) internal virtual {
        require(_account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), _account, _tokens);

        _totalSupply = add(_totalSupply, _tokens);
        balances[_account] = add(balances[_account], _totalSupply);
        emit Transfer(address(0), _account, _tokens);
    }

    function burn(address _account, uint256 _tokens) internal virtual {
        require(_account != address(0), "ERC20: burn from the zero address");

        _beforeTokenTransfer(_account, address(0), _tokens);

        uint256 accountBalance = balances[_account];
        require(
            accountBalance >= _tokens,
            "ERC20: burn amount exceeds balance"
        );

        balances[_account] = sub(accountBalance, _tokens);
        _totalSupply = sub(_totalSupply, _tokens);
    }

    /**
     * @dev Hook that is called before any transfer of tokens. This includes
     * minting and burning.
     * source: Openzeppelin
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}
}
