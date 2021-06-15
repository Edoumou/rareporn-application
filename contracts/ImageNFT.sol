// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "../client/node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ImageNFT is ERC721("NFT Marketplace", "RPNFT") {
    string[] public images;

    uint256 public counter;
    uint256 public ipfsHash;
    uint256 bidIncrement;
    uint256 public highestBindingBid;

    address payable public owner;
    address payable public highestBidder;

    enum State {Running, Ended}
    State public auctionState;

    mapping(address => uint256) public bids;
    mapping(string => bool) imageAlreadyMinted;
    mapping(string => uint256) public imageIDs;

    //====

    constructor() {
        // Initialize the bid incrment to 0.01 ETH
        bidIncrement = 10000000000000000;
        highestBindingBid = 0;

        // The auction starts when the contract is deployed
        auctionState = State.Running;
    }

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

        owner = payable(ownerOf(newImageId));

        counter++;
    }

    function buyImage(uint256 _imageID) public payable returns (bool) {
        // ERC721 contract defines requires needed
        // Double checking would not be optimal since it cost gas

        // get the owner of the image. Always work with local variable
        // not state variable.
        address payable ownerAddress = payable(ownerOf(_imageID));

        require(msg.sender != ownerAddress, "ImageNFT: buy by owner");

        // cash out ETH
        require(
            msg.value != 0 && msg.value < msg.sender.balance,
            "ImageNFT: not enough eth"
        );
        payable(ownerAddress).transfer(msg.value);

        // transfer the token CID from the owner to the buyer
        // images cost 1 ETH
        require(msg.value == 1 ether, "ImageNFT: pay 1 ETH");
        _safeTransfer(ownerAddress, msg.sender, _imageID, "Enjoy!");

        // creturn the address of the new image's owner
        return true;
    }

    //=== Auction
    function placeBid() public payable {
        require(msg.sender != owner, "You're Owner");
        require(auctionState == State.Running);
        require(msg.value >= 0.09 ether, "min: 1 ETH");

        uint256 currentBid = bids[msg.sender] + msg.value;
        require(currentBid > highestBindingBid);
        bids[msg.sender] = currentBid;

        if (currentBid <= bids[highestBidder]) {
            highestBindingBid = min(
                currentBid + bidIncrement,
                bids[highestBidder]
            );
        } else {
            highestBindingBid = min(
                currentBid,
                bids[highestBidder] + bidIncrement
            );
            highestBidder = payable(msg.sender);
        }
    }

    function endAuction() public {
        require(msg.sender == owner, "Not Owner");
        require(auctionState == State.Running);

        auctionState = State.Ended;
    }

    // Withdrawal pattern to avoid re-entrance attacks
    // refund the losser and transfer the image to the highestBidder
    function finalizeAuction(uint256 _imageID) public {
        // Auction need to be cancelled or ended.
        // only the owner or a bidder can finalize the auction
        require(auctionState == State.Ended);
        require(msg.sender != owner && bids[msg.sender] > 0);

        address payable recipient;
        uint256 value;

        // if the caller is the winner, transfer the NFT image
        // if not refund
        if (msg.sender == highestBidder) {
            recipient = highestBidder;
            value = bids[highestBidder] - highestBindingBid;

            // send the amount of ETH to the owner
            owner.transfer(value);

            // transfer the NFT image to the highestBidder
            _safeTransfer(owner, recipient, _imageID, "Enjoy!");
        } else {
            recipient = payable(msg.sender);
            value = bids[msg.sender];

            recipient.transfer(value);
        }
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a <= b) {
            return a;
        } else {
            return b;
        }
    }
}
