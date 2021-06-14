import React, { Component } from 'react';
import ReactFileReader from 'react-file-reader';
import { Grid, Button, Form, Image, Input, Label, Icon } from 'semantic-ui-react';
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
        id: null
    }

    handleFiles = async files => {
        this.setState({
            filename: files.fileList[0].name,
            base64: files.base64,
            mint: 'yes',
            imageCID: ''
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

        // the image from ipfs is stored in state variable imageFromIPFS

        this.setState({
            imageID,
            imageCID,
            owner,
            imageFromIPFS: await FetchFromIPFS(imageCID)
        });
    }

    onBidButtonClick = async () => {
        // the NFT image costs 1 ETH
        const imagePrice = this.props.web3.utils.toWei((1).toString());

        // get the highest bidder and highest binding bid
        let highestBidder = this.props.contractNFT.methods.highestBidder().call();
        let highestBindingBid = this.props.contractNFT.methods.highestBindingBid().call();

        // Bid
        await this.props.contractNFT.methods
            .buyImage(this.state.imageID)
            .send({ from: this.props.account, value: imagePrice });

        let newOwner = await this.props.contractNFT.methods
            .ownerOf(this.state.imageID).call();

        this.setState({ owner: newOwner });

        console.log("imagePrice =", imagePrice);
        console.log("New Owner =", newOwner);

    }

    render() {
        return (
            <div className="ico">
                <div className="token-info">
                    <h1>Welcome to {this.props.imageSymbol} {this.props.imageName} Auction</h1>
                    <h3>highest bidder: {this.props.numberOfMintedImages} </h3>
                    <h3>highest binding bid: </h3>
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
                                Minimum price: <strong>1 ETH</strong>
                                <br></br>
                                <div className='token-buy-input'>
                                    <Input labelPosition='right' type='text' placeholder='displayed above the img'>
                                        <Label basic>Image ID</Label>
                                        <input
                                            value={this.state.tokens}
                                            onChange={e => { this.setState({ id: e.target.value }) }}
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
