// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0; // Note: You must have a version of SolidityX to compile this contract.
import "../abstracts/QMultiChain.sol";

contract Hurricane is QMultiChain {
    event ExternalTransferReceived(
        address indexed from,
        address indexed to,
        uint256 value
    );
    event InternalTransferReceived(
        address indexed from,
        address indexed to,
        uint256 value
    );
    event NoMoreGas(uint256 balance, uint256 gas_left);

    bool private _activated;
    uint8 private _dispatchNumber;

    address[] private _brothers;
    address[] private _owners;
    mapping(uint8 => address) private _owners_map;

    uint private counter = 1;

    constructor(address[] memory owners) {
        _activated = false;
        _owners = owners;
        for (uint i = 0; i < owners.length; i++) {
            _owners_map[getAddressLocation(owners[i])] = owners[i];
        }
    }

    fallback() external payable {
        processFunds();
    }

    receive() external payable {
        processFunds();
    }

    function isOwner(address sender) internal view returns (bool) {
        return _owners_map[getAddressLocation(address(this))] == sender;
    }

    modifier onlyOneOfOwner() {
        require(isOwner(msg.sender), "sender is not owner");
        _;
    }

    function setActive(bool activeStatus) external onlyOneOfOwner {
        _activated = activeStatus;
    }

    function setDispatchNumber(uint8 number) external onlyOneOfOwner {
        _dispatchNumber = number;
    }

    function withdraw() external onlyOneOfOwner {
        sendItx(msg.sender, address(this).balance);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function addBrothers(address[] calldata brothers) external onlyOneOfOwner {
        for (uint i = 0; i < brothers.length; i++) {
            _brothers.push(brothers[i]);
        }
    }

    function processFunds() internal {
        if (isInternal(msg.sender)) {
            emit InternalTransferReceived(msg.sender, address(this), msg.value);
        } else {
            emit ExternalTransferReceived(msg.sender, address(this), msg.value);
        }

        if (gasleft() > 200000) {
            if (_activated) {
                dispatchBrothers();
            } else {
                sendMoneyBack();
            }
        } else {
            emit NoMoreGas(address(this).balance, gasleft());
        }
    }

    function getRandomBrother() internal returns (uint) {
        counter++;
        return
            uint(
                keccak256(
                    abi.encodePacked(block.difficulty, block.timestamp, counter)
                )
            ) % _brothers.length;
    }

    function dispatchBrothers() internal {
        if (_brothers.length > 0) {
            for (uint8 i = 0; i < _dispatchNumber; i++) {
                sendQuaiTo(_brothers[getRandomBrother()], 0.1 ether);
            }
        } else {
            sendMoneyBack();
        }
    }

    function sendQuaiTo(address to, uint256 amount) internal returns (bool) {
        if (isInternal(to)) {
            return sendItx(to, amount);
        } else {
            return sendEtx(to, amount);
        }
    }

    function sendMoneyBack() internal returns (bool) {
        return
            sendQuaiTo(
                _owners_map[getAddressLocation(address(this))],
                address(this).balance
            );
    }

    function sendEtx(address to, uint256 amount) internal returns (bool) {
        bool result;
        uint256 gasEtx = gasleft();
        uint256 value = amount - gasEtx - 1;
        assembly {
            result := etx(
                0, // temp variable, can be anything (unused)
                to, // address to send to
                amount, // amount to send in wei
                gasEtx, // gas limit (entire gas limit will be consumed and sent to destination)
                1, // miner tip in wei
                1, // base fee in wei
                0, // input offset in memory
                0, // input size in memory
                0, // accesslist offset in memory
                0 // accesslist size in memory
            )
        }
        return result;
    }

    function sendItx(address to, uint256 amount) internal returns (bool) {
        (bool sent, bytes memory data) = to.call{value: amount}("");
        require(sent, "Failed to send Quai");
    }
}
