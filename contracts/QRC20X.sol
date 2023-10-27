// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0; // Note: You must have a version of SolidityX to compile this contract.

import "./interfaces/IQRC20.sol";
import "./abstracts/QMultiChain.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract QRC20 is QMultiChain, ERC20 {
    event ExternalTransfer(
        address indexed from,
        address indexed to,
        uint256 value
    );

    /**
     * @dev Sets the values for {name} and {symbol}.
     *
     * The default value of {decimals} is 18. To select a different value for
     * {decimals} you should overload it.
     *
     * All two of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(
        string memory __name,
        string memory __symbol,
        uint256 __totalSupply
    ) ERC20(__name, __symbol) {
        _mint(msg.sender, __totalSupply);
    }

    /**
    * This function sends tokens to an address on another chain by creating an external transaction (ETX).

    * This function uses opETX which constructs an external transaction and adds it to the block.

    * The ETX will make its way over to the destination and automatically execute when the given base fee is correct.

    * `to` must be an address on a different chain. The chain of a given address is determined by the first byte of the address.

    * gasLimit, minerTip and basefee are for executing the transaction on the destination chain. Choose these carefully.

    * The base fee and miner tip are in Wei and may not be the same as they are on your current chain.

    * If the base fee or miner tip are too low, the ETX will wait in the destination chain until they are high enough to be added in a block.

    * You must send a value with the function call equal to the following amount: (baseFee + minerTip) * gasLimit
    */
    function _crossChainTransfer(
        address from,
        address to,
        uint256 amount
    ) internal requireInternal(to) {
        bytes memory encoded = abi.encodeWithSelector(
            this.incomingTransfer.selector,
            to,
            amount
        );
        if (_callCrossChain(encoded, getAddressLocation(to), gasleft())) {
            emit ExternalTransfer(from, to, amount);
            _burn(from, amount);
        }
    }

    /**
     * This function is used by an emitted ETX to send tokens to the sender.
     * The sending contract must be an approved token contract for its respective chain.
     */
    function incomingTransfer(
        address to,
        uint256 amount
    ) public _senderIsAuthorized {
        _mint(to, amount);
    }

    /**
     * @dev Moves `amount` of tokens from `from` to `to`.
     *
     * This internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `from` must have a balance of at least `amount`.
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20) {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        if (_isInternal(to)) {
            ERC20._transfer(from, to, amount);
        } else {
            _beforeTokenTransfer(from, to, amount);
            _crossChainTransfer(from, to, amount);
            _afterTokenTransfer(from, to, amount);
        }
    }
}
