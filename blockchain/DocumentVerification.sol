// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentVerification {

    mapping(string => bool) private storedHashes;

    event DocumentStored(string hash, address indexed sender);

    function storeHash(string memory _hash) public {
        require(!storedHashes[_hash], "Document already exists");

        storedHashes[_hash] = true;

        emit DocumentStored(_hash, msg.sender);
    }

    function verifyHash(string memory _hash) public view returns (bool) {
        return storedHashes[_hash];
    }
}
