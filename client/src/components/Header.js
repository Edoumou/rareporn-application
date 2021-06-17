import React, { Component } from 'react';
import { Menu, Segment } from 'semantic-ui-react';
import { Link, BrowserRouter, Route, Switch } from "react-router-dom";
import Ico from './ERC20/Ico';
import BuyNFT from './NFT/BuyNFT';
import NftAuction from './NFT/NftAuction';

import '../App.css'

class Header extends Component {
    state = {
        activeItem: 'Buy RPT tokens'
    }
    handleItemClick = (e, { name }) => this.setState({ activeItem: name, color: 'orange' });

    render() {
        const { color, activeItem } = this.state;

        return (
            <div className='header'>
                <BrowserRouter>
                    <Segment>
                        <Menu secondary fluid size='huge'>
                            <Menu.Item
                                name={`Buy ${this.props.symbol} tokens`}
                                color={color}
                                active={activeItem === `Buy ${this.props.symbol} tokens`}
                                onClick={this.handleItemClick}
                                as={Link}
                                to="/buy-token"
                            />
                            <Menu.Item
                                name='Buy NFT'
                                color={color}
                                active={activeItem === 'Buy NFT'}
                                onClick={this.handleItemClick}
                                as={Link}
                                to="/buy-nft"
                            />
                            <Menu.Item
                                name='NFT Auction'
                                color={color}
                                active={activeItem === 'NFT Auction'}
                                onClick={this.handleItemClick}
                                as={Link}
                                to="/nft-auction"
                            />
                            <Menu.Item position='right'>
                                <strong>{this.props.account}</strong>
                            </Menu.Item>
                        </Menu>
                    </Segment>
                    <Switch>
                        <Route path='/buy-token'>
                            <Ico
                                web3={this.props.web3}
                                contract={this.props.contract}
                                account={this.props.account}
                                balanceOfOwner={this.props.balanceOfOwner}
                                name={this.props.name}
                                symbol={this.props.symbol}
                                totalSupply={this.props.totalSupply}
                                balanceETH={this.props.balanceETH}
                                balanceRPT={this.props.balanceRPT}
                                investors={this.props.investors}
                                investorsBalance={this.props.investorsBalance}
                            />
                        </Route>
                        <Route path='/buy-nft'>
                            <BuyNFT
                                web3={this.props.web3}
                                account={this.props.account}
                                contractNFT={this.props.contractNFT}
                                imageName={this.props.imageName}
                                imageSymbol={this.props.imageSymbol}
                                numberOfMintedImages={this.props.numberOfMintedImages}
                            />
                        </Route>
                        <Route path='/nft-auction'>
                            <NftAuction
                                web3={this.props.web3}
                                contractNFT={this.props.contractNFT}
                                account={this.props.account}
                                imageName={this.props.imageName}
                                imageSymbol={this.props.imageSymbol}
                                numberOfMintedImages={this.props.numberOfMintedImages}
                            />
                        </Route>
                        <Route path='/'>
                            <div className='home-page'>
                                <h1>Welcome to the ERC20 and ERC721 tokens platform</h1>
                                <h2>
                                    You can participate to the ICO or mint and/or buy our beatufil NFT images
                                    <br></br>
                                    either at a fixed price or by participating on auction
                                </h2>
                            </div>
                        </Route>
                    </Switch>
                </BrowserRouter>
            </div>
        );
    }
}

export default Header;
