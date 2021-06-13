// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "../client/node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ImageNFT is ERC721("NFT Marketplace", "RPNFT") {
    string[] public images;

    uint256 public counter;
    uint256 public startBlock;
    uint256 public endBlock;
    uint256 public ipfsHash;
    uint256 bidIncrement;
    uint256 public highestBindingBid;

    address payable public owner;
    address payable public highestBidder;

    enum State {Started, Running, Ended, Canceled}
    State public auctionState;

    mapping(address => uint256) public bids;
    mapping(string => bool) imageAlreadyMinted;
    mapping(string => uint256) public imageIDs;

    //====

    constructor() {
        // Initialize the bid incrment to 0.5 ETH
        bidIncrement = 500000000000000000;

        // Define stating and ending time to prevent the owner to chose when
        // he should end the auction.
        // using block number is safer than using block.timestamp since miners
        // can change the later. we suppose the auction will last 2 minutes.
        // endBlock = startBlock + (2 * 60)/15

        startBlock = block.number;
        endBlock = startBlock + 8;

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

        counter++;
    }

    function buyImage(uint256 _imageID) public payable returns (bool) {
        // ERC721 contract defines requires needed
        // Double checking would not be optimal since it cost gas

        // get the owner of the image. Always work with local variable
        // not state variable.
        address payable ownerAddress = payable(ownerOf(_imageID));
        owner = ownerAddress;
        require(msg.sender != ownerAddress, "ImageNFT: buy by owner");

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

    //=== Auction
    function placeBid() public payable afterStart beforeEnd {
        require(msg.sender != owner, "You're Owner");
        require(auctionState == State.Running);
        require(msg.value >= 1 ether, "min: 1 ETH");

        uint256 currentBid = bids[msg.sender] + msg.value;
        require(currentBid > highestBindingBid);
        bids[msg.sender] = currentBid;

        if (currentBid < bids[highestBidder]) {
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

    function cancelAuction() public {
        require(msg.sender == owner, "Not Owner");
        auctionState = State.Canceled;
    }

    // Withdrawal pattern to avoid re-entrance attacks
    // refund the losser and transfer the image to the highestBidder
    function finalizeAuction(uint256 _imageID) public {
        // Auction need to be cancelled or ended.
        // only the owner or a bidder can finalize the auction
        require(auctionState == State.Canceled || block.number > endBlock);
        require(msg.sender == owner || bids[msg.sender] > 0);

        address payable recipient;
        uint256 value;

        // treat both auction cancelled or ended
        if (auctionState == State.Canceled) {
            recipient = payable(msg.sender);
            value = bids[msg.sender];

            recipient.transfer(value);
        } else {
            // if the owner makes the call, else if a bidder makes it.
            if (msg.sender == owner) {
                recipient = owner;
                value = highestBindingBid;

                recipient.transfer(value);
            } else {
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
        }
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a <= b) {
            return a;
        } else {
            return b;
        }
    }

    modifier afterStart() {
        require(block.number >= startBlock);
        _;
    }

    modifier beforeEnd() {
        require(block.number <= endBlock);
        _;
    }
}
