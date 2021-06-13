import React, { Component } from 'react';
import { Grid, Input, Button, Label, Table } from 'semantic-ui-react';
import SendToIPFS from '../../utils/SendToIPFS';
import FetchFromIPFS from '../../utils/FetchFromIPFS';
import "../../App.css";

class BuyNFT extends Component {

    state = {
        image: '',
        amount: 0
    }

    render() {
        console.log("NFT SYMBOL =", this.props.imageSymbol);
        return (
            <div className="ico">
                <div className="token-info">
                    <h1>Welcome to {this.props.imageSymbol} {this.props.imageName} Marketplace</h1>
                    <h3>Number of images already minted: {this.props.numberOfMintedImages} </h3>
                </div>
                <hr></hr>

                <div className='token-grid'>
                    <Grid columns={3} celled stackable textAlign='left'>
                        <Grid.Row>
                            <Grid.Column width={3}>
                                <h2>Owner details</h2>
                                <br></br>
                                owner...
                                <br></br>
                                balance ETH
                                <br></br>
                                number of ERC721 tokens
                            </Grid.Column>
                            <Grid.Column textAlign='center' width={5}>
                                <h2>Buy the NFT</h2>
                                <br></br>
                                NFT price: <strong>0.01 ETH</strong>
                                <br></br>
                                <div className='token-buy-input'>
                                    <Button color='orange' onClick={this.onButtonClick}>
                                        Buy
                                    </Button>
                                </div>
                                <br></br>
                            </Grid.Column>
                            <Grid.Column textAlign='center' width={8}>
                                <h2>NFT image</h2>

                                Display the image here
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </div>








            </div>
        );
    }
}

export default BuyNFT
