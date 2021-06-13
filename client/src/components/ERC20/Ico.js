import React, { Component } from 'react';
import { Grid, Input, Button, Label, Table } from 'semantic-ui-react';
import Formate from '../../utils/Formate'
import '../../App.css';

class Ico extends Component {
    state = {
        tokens: 0,
        balanceRPT: 0,
        contractBalance: this.props.balanceOfOwner,
        investors: [],
        investorsBalance: []
    }

    componentDidMount = async () => {
        let tokens = await this.props.contract.methods.balanceOf(this.props.account).call();
        tokens = await this.props.web3.utils.fromWei(tokens.toString());
        this.setState({ balanceRPT: tokens });


        // get investors and their balances
        let investors = await this.props.contract.methods.getListOfUsers().call();
        let investorsBalance = []
        for (let i = 0; i < investors.length; i++) {
            let balance = await this.props.contract.methods.balanceOf(investors[i]).call();
            balance = this.props.web3.utils.fromWei(balance.toString());
            investorsBalance.push(Formate(balance));
        }

        this.setState({
            investors,
            investorsBalance
        });

        await this.getAccount();
    }

    getAccount = async () => {
        if (this.props.web3 !== null || this.props.web3 !== undefined) {
            await window.ethereum.on('accountsChanged', async (accounts) => {
                let tokens = await this.props.contract.methods.balanceOf(this.props.account).call();
                tokens = await this.props.web3.utils.fromWei(tokens.toString());
                this.setState({ balanceRPT: Formate(tokens) });
            });
        }
    }

    onButtonClick = async () => {
        // get the rate of change from the contract and convert the amount
        // of RPT to buy to ETH (wei)
        const rateOfChange = await this.props.contract.methods.rateOfChange().call();
        const ethToSend = this.props.web3.utils.toWei((this.state.tokens / rateOfChange).toString());

        const receipt = await this.props.contract.methods.buyToken()
            .send({ from: this.props.account, value: ethToSend });

        let tokens = await this.props.contract.methods.balanceOf(this.props.account).call();
        tokens = await this.props.web3.utils.fromWei(tokens.toString());

        // get the amount of tokens remaining for sale
        this.setState({ balanceRPT: tokens })

        // call the contract to get the new balance of the owner
        // and send it back to header component to update  the state
        let owner = await this.props.contract.methods.getOwnerAddress().call();
        let balanceOfOwner = await this.props.contract.methods.balanceOf(owner).call();
        balanceOfOwner = await this.props.web3.utils.fromWei(balanceOfOwner.toString());

        // update the list of investors and their balnces
        // get investors and their balances
        let investors = await this.props.contract.methods.getListOfUsers().call();
        let investorsBalance = []
        for (let i = 0; i < investors.length; i++) {
            let balance = await this.props.contract.methods.balanceOf(investors[i]).call();
            balance = this.props.web3.utils.fromWei(balance.toString());
            investorsBalance.push(Formate(balance));
        }

        this.setState({
            contractBalance: Formate(balanceOfOwner),
            investors,
            investorsBalance
        });


        console.log("Tokens =", this.state.tokens)
        console.log("Rate of Change =", rateOfChange);
        console.log("ETH Amount =", ethToSend);
        console.log("WEB3 =", this.props.web3.utils);
        console.log("RECEIPT =", receipt);

        this.setState({ tokens: 0 });
    }

    render() {
        return (
            <div className="ico">
                <div className="token-info">
                    <h1>Welcome to {this.props.name} ({this.props.symbol}) ICO</h1>
                    <h3>Total Supply: {this.props.totalSupply} </h3>
                    <h3>Token available for sale: {this.state.contractBalance}</h3>
                </div>
                <hr></hr>
                <div className='token-grid'>
                    <Grid columns={3} celled stackable textAlign='left'>
                        <Grid.Row>
                            <Grid.Column width={3}>
                                <h2>Account details</h2>
                                <br></br>
                                {this.props.account.slice(0, 10)}...
                                <br></br>
                                {this.props.balanceETH} ETH
                                <br></br>
                                {this.state.balanceRPT} RPT
                            </Grid.Column>
                            <Grid.Column textAlign='center' width={5}>
                                <h2>Buy tokens</h2>
                                <br></br>
                                Token price: <strong>0.001 ETH</strong>
                                <br></br>
                                min: 10 - max: 10000
                                <br></br>
                                <div className='token-buy-input'>
                                    <Input labelPosition='right' type='text' placeholder='min: 10 - max: 10,000'>
                                        <Label basic>Amount</Label>
                                        <input
                                            value={this.state.tokens}
                                            onChange={e => { this.setState({ tokens: e.target.value }) }}
                                        />
                                        <Label>{this.props.symbol}</Label>
                                    </Input>
                                </div>
                                <br></br>
                                <Button color='orange' onClick={this.onButtonClick}>
                                    Buy
                                </Button>
                            </Grid.Column>
                            <Grid.Column textAlign='center' width={8}>
                                <h2>List of investors</h2>

                                <Table celled>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Investor</Table.HeaderCell>
                                            <Table.HeaderCell textAlign='right'>{this.props.symbol} Balance</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {
                                            this.state.investors.map((res, index, arr) =>
                                                <Table.Row key={index}>
                                                    <Table.Cell>{this.state.investors[index]}</Table.Cell>
                                                    <Table.Cell textAlign='right'>{this.state.investorsBalance[index]}</Table.Cell>
                                                </Table.Row>
                                            )
                                        }
                                    </Table.Body>
                                </Table>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </div>

            </div>
        );
    }
}

export default Ico;
