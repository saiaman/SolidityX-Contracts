// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract HelloWorld {
    string public message;

    constructor(string memory _message) {
        message = _message;
    }
}

contract SampleCreate {
    event ContractCreated(address contractAddress);

    constructor() {}

    function createTest(string calldata message) public returns (address) {
        HelloWorld d = new HelloWorld(message);
        emit ContractCreated(address(d));
        return address(d);
    }
}
