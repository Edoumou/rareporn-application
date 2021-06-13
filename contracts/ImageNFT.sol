// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "../client/node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ImageNFT is ERC721("Rare Platform NFT", "RPNFT") {
    uint256 public counter;
    string[] public images;
    mapping(string => bool) imageAlreadyMinted;

    constructor() {}

    function createImage(string memory _imageCID) public returns (uint256) {
        // cannot mint the same image twice.
        // IPFS will be used to store images returning a unique CID (image URI).
        // Since CIDs are based on the image content, same image will always
        // return same CID.
        require(!imageAlreadyMinted[_imageCID], "image already minted");
        uint256 newImageId = counter;

        // store the image URI on the Blockchain
        images.push(_imageCID);

        // mint the image
        _safeMint(msg.sender, newImageId);

        // store the information that the image has been minted
        imageAlreadyMinted[_imageCID] = true;

        counter++;

        // return the Id of the image
        return newImageId;
    }
}
