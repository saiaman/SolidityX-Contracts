// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract QMultiChain is Ownable {
    // List of external token contracts that can send tokens to users on this chain
    address[12] public ApprovedAddresses;

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

    function getAddressLocation(address addr) internal view returns (uint8) {
        uint8 prefix = uint8(toBytes(addr)[0]);
        for (uint8 i = 0; i < 9; i++) {
            if (prefix >= Ranges[i].low && prefix <= Ranges[i].high) {
                return i;
            }
        }
        revert("Invalid Location");
    }

    function AddApprovedAddress(uint8 chain, address addr) public onlyOwner {
        bool isInternal;
        assembly {
            isInternal := isaddrinternal(addr)
        }
        require(!isInternal, "Address is not external");
        require(chain < 9, "Max 9 zones");
        require(
            ApprovedAddresses[chain] == address(0),
            "The approved address for this zone already exists"
        );
        ApprovedAddresses[chain] = addr;
    }

    function AddApprovedAddresses(
        uint8[] calldata chain,
        address[] calldata addr
    ) external onlyOwner {
        require(
            chain.length == addr.length,
            "chain and address arrays must be the same length"
        );
        for (uint8 i = 0; i < chain.length; i++) {
            require(chain[i] < 9, "Max 9 zones");
            require(
                ApprovedAddresses[chain[i]] == address(0),
                "The approved address for this zone already exists"
            );
            ApprovedAddresses[chain[i]] = addr[i];
        }
    }

    function toBytes(address a) public pure returns (bytes memory) {
        return abi.encodePacked(a);
    }
}
