pragma solidity ^0.5.0;


contract AtomicSwapEther {
    uint256 constant private SECRET_KEY_LENGTH = 32;

    struct Swap {
        uint256 timelock;
        uint256 value;
        address payable ethTrader;
        address payable withdrawTrader;
        bytes32 secretLock;
        bytes secretKey;
    }

    enum States {
        INVALID,
        OPEN,
        CLOSED,
        EXPIRED
    }

    mapping (bytes32 => Swap) private swaps;
    mapping (bytes32 => States) private swapStates;

    event Open(bytes32 _swapID, address _withdrawTrader, bytes32 _secretLock);
    event Expire(bytes32 _swapID);
    event Close(bytes32 _swapID, bytes _secretKey);

    modifier onlyInvalidSwaps(bytes32 _swapID) {
        require(swapStates[_swapID] == States.INVALID);
        _;
    }

    modifier onlyOpenSwaps(bytes32 _swapID) {
        require(swapStates[_swapID] == States.OPEN, "No open swap found for the given ID");
        _;
    }

    modifier onlyClosedSwaps(bytes32 _swapID) {
        require(swapStates[_swapID] == States.CLOSED);
        _;
    }

    modifier onlyExpirableSwaps(bytes32 _swapID) {
        require(now >= swaps[_swapID].timelock, "Swap for the given ID is not yet expired");
        _;
    }

    modifier onlyWithSecretKey(bytes32 _swapID, bytes memory _secretKey) {
        require(_secretKey.length == SECRET_KEY_LENGTH, "Secret key must be 32 bytes");
        require(swaps[_swapID].secretLock == sha256(_secretKey), "Secret key does not match secret lock");
        _;
    }

    function open(bytes32 _swapID, address payable _withdrawTrader, bytes32 _secretLock,
        uint256 _timelock) public onlyInvalidSwaps(_swapID) payable {

        // Store the details of the swap.
        Swap memory swap = Swap({
            timelock: _timelock,
            value: msg.value,
            ethTrader: msg.sender,
            withdrawTrader: _withdrawTrader,
            secretLock: _secretLock,
            secretKey: new bytes(0)
        });
        swaps[_swapID] = swap;
        swapStates[_swapID] = States.OPEN;

        // Trigger open event.
        emit Open(_swapID, _withdrawTrader, _secretLock);
    }

    function close(bytes32 _swapID, bytes memory _secretKey) public onlyOpenSwaps(_swapID)
        onlyWithSecretKey(_swapID, _secretKey) {

        // Close the swap.
        Swap memory swap = swaps[_swapID];
        swaps[_swapID].secretKey = _secretKey;
        swapStates[_swapID] = States.CLOSED;

        // Transfer the ETH funds from this contract to the withdrawing trader.
        swap.withdrawTrader.transfer(swap.value);

        // Trigger close event.
        emit Close(_swapID, _secretKey);
    }

    function expire(bytes32 _swapID) public onlyOpenSwaps(_swapID) onlyExpirableSwaps(_swapID) {
        // Expire the swap.
        Swap memory swap = swaps[_swapID];
        swapStates[_swapID] = States.EXPIRED;

        // Transfer the ETH value from this contract back to the ETH trader.
        swap.ethTrader.transfer(swap.value);

        // Trigger expire event.
        emit Expire(_swapID);
    }

    function check(bytes32 _swapID) public view returns (uint256 timelock, uint256 value,
        address withdrawTrader, bytes32 secretLock) {

        Swap memory swap = swaps[_swapID];
        return (swap.timelock, swap.value, swap.withdrawTrader, swap.secretLock);
    }

    function checkSecretKey(bytes32 _swapID) public view onlyClosedSwaps(_swapID) returns (bytes memory secretKey) {
        Swap memory swap = swaps[_swapID];
        return swap.secretKey;
    }
}
