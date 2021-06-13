// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "../client/node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ImageNFT is ERC721("NFT Marketplace", "RPNFT") {
    uint256 public counter;
    string[] public images;
    mapping(string => bool) imageAlreadyMinted;
    mapping(string => uint256) public imageIDs;

    constructor() {}

    function createImage(string memory _imageCID) public {
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

        // store the image ID of the image CID in a mapping
        imageIDs[_imageCID] = newImageId;

        counter++;
    }

    function buyImage(uint256 _imageID) public payable returns (bool) {
        // ERC721 contract defines requires needed
        // Double checking would not be optimal since it cost gas

        // get the owner of the image
        address owner = ownerOf(_imageID);
        require(msg.sender != owner, "ImageNFT: buy by owner");

        // cash out ETH
        require(
            msg.value != 0 && msg.value < msg.sender.balance,
            "ImageNFT: not enough eth"
        );
        payable(owner).transfer(msg.value);

        // transfer the token CID from the owner to the buyer
        // images cost 1 ETH
        require(msg.value == 1 ether, "ImageNFT: pay 1 ETH");
        _safeTransfer(owner, msg.sender, _imageID, "Enjoy!");

        // creturn the address of the new image's owner
        return true;
    }
}
