// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.0;

interface IQMultiChain {
    function getAddressForDestination(
        uint8 destination
    ) external view returns (address);

    function _callCrossChain(
        bytes memory payload,
        uint8 destination,
        uint256 _gasLeft
    ) external returns (bool);

    function getApprovedAddressForSender(
        address sender
    ) external returns (address);

    function getAddressLocation(address addr) external view returns (uint8);

    function AddApprovedAddress(uint8 chain, address addr) external;

    function AddApprovedAddresses(
        uint8[] calldata chain,
        address[] calldata addr
    ) external;
}
