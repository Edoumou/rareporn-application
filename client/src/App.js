import React, { Component } from "react";
import getICOContract from './getICOContract';
import getNFTContract from './getNFTContract';
import Formate from './utils/Formate';
import getWeb3 from "./getWeb3";
import Home from "../src/components/Home";

import 'semantic-ui-css/semantic.min.css'
import "./App.css";

require('dotenv').config();

class App extends Component {
  state = {
    web3: null,
    account: null,
    contract: null,
    contractNFT: null,
    name: '',
    imageName: '',
    symbol: '',
    imageSymbol: '',
    balanceETH: 0,
    balanceRPT: 0,
    totalSupply: 0,
    balanceOfowner: 0,
    investors: [],
    investorsBalance: [],
    numberOfMintedImages: 0
  };

  componentDidMount = async () => {
    try {
      // connect to web3 and get contract instances
      const web3 = await getWeb3();

      //== ERC20 token contract
      const contract = await getICOContract(web3);
      console.log('CONTRACT =', contract);

      //== ERC721 token contract
      const contractNFT = await getNFTContract(web3);
      console.log('NFT CONTRACT =', this.state.contractNFT);

      const accounts = await web3.eth.getAccounts();

      // get eth balance and RPT balance of the user
      await web3.eth.getBalance(accounts[0], (err, balance) => {
        if (!err) {
          this.setState({ balanceETH: Formate(web3.utils.fromWei(balance, 'ether')) });
        }
      });

      let tokens = await contract.methods.balanceOf(accounts[0]).call();
      tokens = await web3.utils.fromWei(tokens.toString());

      // get the amount of tokens remaining for sale
      let owner = await contract.methods.getOwnerAddress().call();
      let balanceOfOwner = await contract.methods.balanceOf(owner).call();
      balanceOfOwner = await web3.utils.fromWei(balanceOfOwner.toString());

      // Update states
      this.setState(
        {
          web3,
          contract,
          contractNFT: contractNFT,
          owner,
          account: accounts[0],
          balanceRPT: Formate(tokens),
          balanceOfOwner: Formate(balanceOfOwner)
        },
        this.start
      );
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  }

  start = async () => {
    const { web3, contract, contractNFT } = this.state;

    // update account in state with the current account,
    // this allows to display automatically the current 
    // account when the user changes the account. 
    this.getAccount();

    //==== ERC20 token
    // convert the total supply from wei to eth
    let totalSupply = await contract.methods.totalSupply().call();
    totalSupply = web3.utils.fromWei(totalSupply.toString());

    // get the amount of tokens remaining for sale
    let owner = await contract.methods.getOwnerAddress().call();
    let balanceOfOwner = await contract.methods.balanceOf(owner).call();
    balanceOfOwner = await web3.utils.fromWei(balanceOfOwner.toString());

    // get investors and their balances
    let investors = await contract.methods.getListOfUsers().call();
    let investorsBalance = []
    for (let i = 0; i < investors.length; i++) {
      let balance = await await contract.methods.balanceOf(investors[i]).call();
      balance = web3.utils.fromWei(balance.toString());
      investorsBalance.push(Formate(balance));
    }

    //==== ERC721 token


    // update states
    this.setState({
      totalSupply: Formate(totalSupply),
      balanceOfOwner: Formate(balanceOfOwner),
      name: await contract.methods.name().call(),
      symbol: await contract.methods.symbol().call(),
      investors: investors,
      investorsBalance: investorsBalance,
      imageName: await contractNFT.methods.name().call(),
      imageSymbol: await contractNFT.methods.symbol().call(),
      numberOfMintedImages: await contractNFT.methods.counter().call()

    });
  }

  getAccount = async () => {
    if (this.state.web3 !== null || this.state.web3 !== undefined) {
      await window.ethereum.on('accountsChanged', async (accounts) => {
        this.setState({
          account: accounts[0]
        });

        this.state.web3.eth.getBalance(accounts[0], (err, balance) => {
          if (!err) {
            this.setState({ balanceETH: Formate(this.state.web3.utils.fromWei(balance, 'ether')) });
          }
        });

        let tokens = await this.state.contract.methods.balanceOf(this.state.account).call();
        tokens = await this.state.web3.utils.fromWei(tokens.toString());
        this.setState({ balanceRPT: Formate(tokens) });
      });
    }
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <Home
          web3={this.state.web3}
          contract={this.state.contract}
          account={this.state.account}
          balanceOfOwner={this.state.balanceOfOwner}
          name={this.state.name}
          symbol={this.state.symbol}
          totalSupply={this.state.totalSupply}
          balanceETH={this.state.balanceETH}
          balanceRPT={this.state.balanceRPT}
          investors={this.state.investors}
          investorsBalance={this.state.investorsBalance}
          contractNFT={this.state.contractNFT}
          imageName={this.state.imageName}
          imageSymbol={this.state.imageSymbol}
          numberOfMintedImages={this.state.numberOfMintedImages}
        />
      </div>
    );
  }
}

export default App;
