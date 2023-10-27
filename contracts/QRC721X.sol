// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0; // Note: You must have a version of SolidityX to compile this contract.

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./abstracts/QMultiChain.sol";

/**
 * @dev Standard ERC721 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC721 tokens.
 */
interface IERC721Errors {
    /**
     * @dev Indicates that an address can't be an owner. For example, `address(0)` is a forbidden owner in EIP-20.
     * Used in balance queries.
     * @param owner Address of the current owner of a token.
     */
    error ERC721InvalidOwner(address owner);

    /**
     * @dev Indicates a `tokenId` whose `owner` is the zero address.
     * @param tokenId Identifier number of a token.
     */
    error ERC721NonexistentToken(uint256 tokenId);

    /**
     * @dev Indicates an error related to the ownership over a particular token. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param tokenId Identifier number of a token.
     * @param owner Address of the current owner of a token.
     */
    error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC721InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC721InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `operator`’s approval. Used in transfers.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     * @param tokenId Identifier number of a token.
     */
    error ERC721InsufficientApproval(address operator, uint256 tokenId);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC721InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `operator` to be approved. Used in approvals.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC721InvalidOperator(address operator);
}

/**
 * @dev Implementation of https://eips.ethereum.org/EIPS/eip-721[ERC721] Non-Fungible Token Standard, including
 * the Metadata extension, but not including the Enumerable extension, which is available separately as
 * {ERC721Enumerable}.
 * This implementation supports cross-chain transfers.
 */
contract QRC721 is
    IERC721Receiver,
    ERC721Enumerable,
    QMultiChain,
    IERC721Errors
{
    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */

    event ExternalTransfer(
        address indexed from,
        address indexed to,
        uint256 tokenId
    );

    using Strings for uint256;
    string private __tokenBaseUri;
    uint256 private _currentTokenIdx = 0;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseUri
    ) ERC721(name, symbol) {
        __tokenBaseUri = baseUri;
        _mint(msg.sender, _currentTokenIdx++);
    }

    function mint(address to, uint256 quantity) external onlyOwner {
        require(to != address(0), "only mint to non 0x0");
        for (uint i = 0; i < quantity; i++) {
            _mint(to, _currentTokenIdx++);
        }
    }

    function _baseURI() internal view override returns (string memory) {
        return __tokenBaseUri;
    }

    // function tokenURI(
    //     uint256 tokenId
    // ) public view override returns (string memory) {
    //     _requireMinted(tokenId);

    //     string memory baseURI = _baseURI();
    //     return
    //         bytes(baseURI).length > 0
    //             ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
    //             : "";
    // }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    /**
     * This function is used by an emitted ETX to send tokens to the sender.
     * The sending contract must be an approved token contract for its respective chain.
     */
    function incomingTransfer(address to, uint256 tokenId) public {
        require(
            ApprovedAddresses[getAddressLocation(msg.sender)] == msg.sender,
            string(
                abi.encodePacked(
                    "Sender ",
                    abi.encodePacked(msg.sender),
                    " not approved"
                )
            )
        );
        _mint(to, tokenId);

        emit Transfer(address(0), to, tokenId);
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        bool isInternal;
        assembly {
            isInternal := isaddrinternal(to) // This opcode returns true if an address is internal
        }
        if (isInternal) {
            super._transfer(from, to, tokenId);
        } else {}
    }

    function _crossChainTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal {
        bytes memory encoded = abi.encodeWithSignature(
            "incomingTransfer(address,uint256)",
            to,
            tokenId
        );
        if (_callCrossChain(encoded, getAddressLocation(to), gasleft())) {
            emit ExternalTransfer(from, to, tokenId);
            _burn(tokenId);
        }
    }
}
