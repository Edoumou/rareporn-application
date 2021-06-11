import React, { Component } from "react";
import getICOContract from './getICOContract';
import Formate from './utils/Formate';
import getWeb3 from "./getWeb3";
import Ico from "./components/ERC20/Ico";

import 'semantic-ui-css/semantic.min.css'
import "./App.css";

class App extends Component {
  state = {
    web3: null,
    account: null,
    contract: null,
    name: '',
    symbol: '',
    totalSupply: 0
  };

  componentDidMount = async () => {
    try {
      // connect to web3 and get contract instances
      const web3 = await getWeb3();
      const contract = await getICOContract(web3);
      const accounts = await web3.eth.getAccounts();

      // Update states
      this.setState(
        {
          web3,
          contract,
          account: accounts[0]
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
    const { web3, contract } = this.state;

    // update account in state with the current account,
    // this allows to display automatically the current 
    // account when the user changes the account. 
    this.getAccount();

    // convert the total supply from wei to eth
    let totalSupply = await contract.methods.totalSupply().call();
    totalSupply = web3.utils.fromWei(totalSupply.toString());

    // update states
    this.setState({
      totalSupply: Formate(totalSupply),
      name: await contract.methods.name().call(),
      symbol: await contract.methods.symbol().call()
    });
  }

  getAccount = async () => {
    if (this.state.web3 !== null || this.state.web3 !== undefined) {
      await window.ethereum.on('accountsChanged', (accounts) => {
        this.setState({
          account: accounts[0]
        });
      });
    }
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <Ico />
      </div>
    );
  }
}

export default App;
