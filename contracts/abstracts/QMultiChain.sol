// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IQMultiChain.sol";

abstract contract QMultiChain is Ownable {
    // List of external token contracts that can send tokens to users on this chain
    address[12] private ApprovedAddresses;

    // Address prefix range
    struct Range {
        uint8 low;
        uint8 high;
    }

    // List of address prefix ranges (for checking which chain an address belongs to)
    Range[13] public Ranges;

    constructor() {
        Ranges[0] = Range(0, 29); // zone 0-0 // cyprus1
        Ranges[1] = Range(30, 58); // zone 0-1 // cyprus2
        Ranges[2] = Range(59, 87); // zone 0-2 // cyprus3
        Ranges[3] = Range(88, 115); // zone 1-0 // paxos1
        Ranges[4] = Range(116, 143); // zone 1-1 // paxos2
        Ranges[5] = Range(144, 171); // zone 1-2 // paxos3
        Ranges[6] = Range(172, 199); // zone 2-0 // hydra1
        Ranges[7] = Range(200, 227); // zone 2-1 // hydra2
        Ranges[8] = Range(228, 255); // zone 2-2 // hydra3
    }

    modifier _senderIsAuthorized() {
        require(
            getApprovedAddressForSender(msg.sender) == msg.sender,
            string(
                abi.encodePacked(
                    "Sender ",
                    abi.encodePacked(msg.sender),
                    " not approved"
                )
            )
        );
        _;
    }

    modifier _destinationIsApproved(uint8 destination) {
        address toAddr = getAddressForDestination(destination);
        require(
            toAddr != address(0),
            "Contract is not available on destination chain"
        );
        _;
    }

    modifier requireInternal(address addr) {
        require(!_isInternal(addr), "Address is not external");
        _;
    }

    function _isInternal(address addr) internal pure returns (bool isInternal) {
        assembly {
            isInternal := isaddrinternal(addr)
        }
    }

    function isInternal(address sender) internal view returns (bool) {
        return getAddressLocation(sender) == getAddressLocation(address(this));
    }

    function getApprovedAddressForSender(
        address sender
    ) internal view returns (address) {
        return ApprovedAddresses[getAddressLocation(sender)];
    }

    function getAddressForDestination(
        uint8 destination
    ) internal view returns (address) {
        return ApprovedAddresses[destination];
    }

    function _callCrossChain(
        bytes memory payload,
        uint8 destination,
        uint256 _gasLeft
    ) internal _destinationIsApproved(destination) returns (bool) {
        address toAddr = ApprovedAddresses[destination];
        require(
            toAddr != address(0),
            "Contract is not available on destination chain"
        );
        bool success; // this is not used. opETX only returns false if there was an error in creating the ETX, not executing it.
        assembly {
            success := etx(
                0, // temp variable, can be anything (unused)
                toAddr, // address to send to
                0, // amount to send in wei
                _gasLeft, // gas limit (entire gas limit will be consumed and sent to destination)
                1, // miner tip in wei
                1, // base fee in wei
                add(payload, 0x20), // input offset in memory (the first 32 byte number is just the size of the array)
                mload(payload), // input size in memory (loading the first number gives the size)
                0, // accesslist offset in memory
                0 // accesslist size in memory
            )
        }
        return success;
    }

    function getAddressLocation(address addr) internal view returns (uint8) {
        uint8 prefix = uint8(toBytes(addr)[0]);
        for (uint8 i = 0; i < 9; i++) {
            if (prefix >= Ranges[i].low && prefix <= Ranges[i].high) {
                return i;
            }
        }
        revert("Invalid Location");
    }

    function AddApprovedAddress(
        address addr
    ) external onlyOwner requireInternal(addr) {
        uint8 chain = getAddressLocation(addr);
        require(
            chain != getAddressLocation(address(this)) && addr != address(this),
            "This address is internal and not the current one"
        );
        require(
            ApprovedAddresses[chain] == address(0),
            "The approved address for this zone already exists"
        );
        ApprovedAddresses[chain] = addr;
    }

    function AddApprovedAddresses(address[] calldata addr) external onlyOwner {
        for (uint8 i = 0; i < addr.length; i++) {
            this.AddApprovedAddress(addr[i]);
        }
    }

    function toBytes(address a) public pure returns (bytes memory) {
        return abi.encodePacked(a);
    }
}
