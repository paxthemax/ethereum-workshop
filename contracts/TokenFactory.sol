pragma solidity ^0.5.0;

import "./vendor/Ownable.sol";
import "./IOEToken.sol";

contract TokenFactory is Ownable {
    uint8 public constant MAX_DECIMALS = 18;

    event NewToken(address indexed addr, string indexed symbol, string name);

    function createToken(
        uint256 _cap,
        string calldata _name,
        string calldata _symbol,
        uint8 _decimals
    ) external {
        _createToken(_cap, _name, _symbol, _decimals);
    }

    function _createToken(
        uint256 _cap,
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) private onlyOwner {
        require(
            _decimals <= MAX_DECIMALS,
            "Number of decimals exceeds maximum"
        );

        IOEToken token = new IOEToken(_cap, _name, _symbol, _decimals);
        emit NewToken(address(token), _symbol, _name);
    }
}
