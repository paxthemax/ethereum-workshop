pragma solidity ^0.5.0;

import "./vendor/ERC20Capped.sol";

contract IOEToken is ERC20Capped {
    string public name;
    string public symbol;
    uint8 public decimals;

    constructor(
        uint256 _cap,
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) public ERC20Capped(_cap) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }
}