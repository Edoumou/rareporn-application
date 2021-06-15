import React, { Component } from 'react';
import ReactFileReader from 'react-file-reader';
import { Grid, Button, Form, Image, Input, Label, Icon } from 'semantic-ui-react';
import Formate from '../../utils/Formate';
import SendToIPFS from '../../utils/SendToIPFS';
import FetchFromIPFS from '../../utils/FetchFromIPFS';
import "../../App.css";

class NftAuction extends Component {

    state = {
        owner: '',
        image: '',
        amount: 0,
        filename: '',
        mint: '',
        base64: '',
        imageFromIPFS: '',
        imageID: '',
        imageCIDFromContract: '',
        id: null,
        highestBidder: '',
        highestBindingBid: 0,
        auctionState: ''
    }

    componentDidMount = async () => {
        // get the highest bidder and highest binding bid
        let auctionState = await this.props.contractNFT.methods.auctionState().call();
        let highestBidder = await this.props.contractNFT.methods.highestBidder().call();

        let highestBindingBid = await this.props.contractNFT.methods.highestBindingBid().call();
        highestBindingBid = await this.props.web3.utils.fromWei(highestBindingBid.toString());

        console.log("AUCTION STATE =", auctionState);

        // store initial states for auction
        this.setState({
            highestBidder,
            highestBindingBid: Formate(highestBindingBid)
        });

        auctionState === '0' ?
            this.setState({ auctionState: 'Started' }) :
            auctionState === '1' ?
                this.setState({ auctionState: 'Running' }) :
                auctionState === '2' ?
                    this.setState({ auctionState: 'Ended' }) :
                    this.setState({ auctionState: 'Canceled' });
    }

    handleFiles = async files => {
        this.setState({
            filename: files.fileList[0].name,
            base64: files.base64,
            mint: 'yes',
            imageCID: '',
            bid: 0
        });

    }

    onButtonClick = async e => {
        e.preventDefault();

        this.setState({ mint: '' });

        // send the image to ipfs and get its cid
        let CID = await SendToIPFS(this.state.base64);

        // Mint the image and store its CID to the Blockchain
        await this.props.contractNFT.methods
            .createImage(CID).send({ from: this.props.account });

        // Now the image has been minted, one can get its CID from the contract
        // First let's get the ID that has been stored to the contract,
        // it ensures all information are coming from the Blockchain.
        let imageID = await this.props.contractNFT.methods
            .imageIDs(CID).call();
        let imageCID = await this.props.contractNFT.methods.images(imageID).call();

        // get the owner of the image from the contract
        const owner = await this.props.contractNFT.methods.ownerOf(imageID).call();

        this.setState({
            imageID,
            imageCID,
            owner,
            imageFromIPFS: await FetchFromIPFS(imageCID)
        });
    }

    onBidButtonClick = async () => {
        // convert the bid to wei and send it to the contract
        const bid = await this.props.web3.utils.toWei(this.state.bid.toString());
        console.log("BID =", this.state.bid);

        await this.props.contractNFT.methods.placeBid()
            .send({ from: this.props.account, value: bid });

        // update the highest bidder and highest binding bid
        let highestBidder = await this.props.contractNFT.methods.highestBidder().call();
        let highestBindingBid = await this.props.contractNFT.methods.highestBindingBid().call();
        highestBindingBid = await this.props.web3.utils.fromWei(highestBindingBid.toString());

        // get the new owner of the image from the contract and set it to state variable
        const owner = await this.props.contractNFT.methods.ownerOf(this.state.id).call();

        this.setState({
            owner,
            highestBidder,
            highestBindingBid: Formate(highestBindingBid)
        });

    }

    onAuctionCanceled = async () => {
        // Only the owner can cancel the auction (requires in the contract)
        await this.props.contractNFT.methods.cancelAuction()
            .send({ from: this.props.account });

        // update the auction's state
        let auctionState = await this.props.contractNFT.methods.auctionState().call();

        auctionState === '0' ?
            this.setState({ auctionState: 'Started' }) :
            auctionState === '1' ?
                this.setState({ auctionState: 'Running' }) :
                auctionState === '2' ?
                    this.setState({ auctionState: 'Ended' }) :
                    this.setState({ auctionState: 'Canceled' });
    }

    onAuctionTerminated = async () => {
        // Each participant should click this button either
        //for the refund or to get the NFT image(winner)
        await this.props.contractNFT.methods.finalizeAuction(this.state.id)
            .send({ from: this.props.account });

        // update the auction's state
        let auctionState = await this.props.contractNFT.methods.auctionState().call();

        auctionState === '0' ?
            this.setState({ auctionState: 'Started' }) :
            auctionState === '1' ?
                this.setState({ auctionState: 'Running' }) :
                auctionState === '2' ?
                    this.setState({ auctionState: 'Ended' }) :
                    this.setState({ auctionState: 'Canceled' });
    }

    render() {
        return (
            <div className="ico">
                <div className="token-info">
                    <h1>Welcome to {this.props.imageSymbol} {this.props.imageName} Auction</h1>
                    <h3>
                        Auction state:
                        <span style={{ color: 'orange' }}> {this.state.auctionState}</span>
                    </h3>
                    <h3>highest bidder: {this.state.highestBidder} </h3>
                    <h3 className="pad-bott">highest binding bid: {this.state.highestBindingBid} </h3>
                    <Button color='red' onClick={this.onAuctionCanceled}>
                        Cancel auction
                    </Button>
                    <br></br>
                    <br></br>
                    <span className='input-btn'>
                        <Input placeholder='Image ID' onChange={e => { this.setState({ id: e.target.value }) }}>
                        </Input>
                    </span>
                    <Button color='blue' onClick={this.onAuctionTerminated}>
                        Terminate auction
                    </Button>
                </div>
                <hr></hr>

                <div className='token-grid'>
                    <Grid columns={3} celled stackable>
                        <Grid.Row>
                            <Grid.Column textAlign='center' width={4}>
                                <h2>Mint an image or bid <Icon name='hand point right' color='orange' />
                                    <br></br>
                                for existing image</h2>
                                <br></br>
                                Upload image
                                <br></br>
                                <div className='token-buy-input'>
                                    <Form size="large">
                                        <Form.Field>
                                            <ReactFileReader
                                                fileTypes={[".png", ".jpeg", ".gif", ".pdf", ".psd", ".eps", ".ai", ".indd", ".tiff", ".bmp"]}
                                                base64={true} handleFiles={this.handleFiles}
                                            >
                                                {
                                                    this.state.mint === '' ?
                                                        <Button>Upload</Button> :
                                                        <p></p>
                                                }
                                            </ReactFileReader>
                                        </Form.Field>

                                        {
                                            this.state.mint !== '' ?
                                                <Button primary onClick={this.onButtonClick}>Mint</Button> :
                                                console.log('Waiting for file upload')
                                        }

                                    </Form>
                                </div>
                            </Grid.Column>
                            <Grid.Column textAlign='center' width={4}>
                                <h2>Your bid</h2>
                                <br></br>
                                <Input placeholder='Image ID' onChange={e => { this.setState({ id: e.target.value }) }}>
                                </Input>
                                <br></br>
                                <br></br>
                                Minimum price: <strong>1 ETH</strong>
                                <br></br>
                                <div className='token-buy-input'>
                                    <Input labelPosition='right' type='text' placeholder='min: 1 ETH'>
                                        <Label basic>Amout</Label>
                                        <input
                                            onChange={e => { this.setState({ bid: e.target.value }) }}
                                        />
                                    </Input>
                                </div>

                                <br></br>
                                <div className='token-buy-input'>
                                    <Button color='orange' onClick={this.onBidButtonClick}>
                                        Bid
                                    </Button>
                                </div>
                                <br></br>
                            </Grid.Column>
                            <Grid.Column textAlign='center' width={8}>
                                <h2>NFT image</h2>
                                <br></br>
                                ID: <strong>{this.state.imageID}</strong>
                                <br></br>
                                owner: <strong>{this.state.owner}</strong>
                                <br></br>
                                {
                                    this.state.imageID !== '' ?
                                        <div className='img-center'>
                                            <Image
                                                src={this.state.imageFromIPFS}
                                                size='medium'
                                            />
                                        </div>
                                        :
                                        console.log("load image")
                                }
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </div>

            </div>
        );
    }
}

export default NftAuction
