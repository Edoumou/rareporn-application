import React, { Component } from 'react';
import Header from "./Header";
import "../App.css";

class Home extends Component {
    render() {
        return (
            <div className='home'>
                <Header
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
                    contractNFT={this.props.contractNFT}
                    imageName={this.props.imageName}
                    imageSymbol={this.props.imageSymbol}
                    numberOfMintedImages={this.props.numberOfMintedImages}
                />
            </div>
        )
    }
}

export default Home
