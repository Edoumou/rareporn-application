# Rare Plateform Token and NFT Marketplace

The goal of this project is to create a complete ERC20 cryptocurrency from scratch and a simple NFT (ERC721 token) and a marketplace where one can buy tokens and images. Solidity, Javascript and NodeJS are used for the Back-End and the truffle react box and semantic-ui react for the Front-End, and the two contracts have been deployed to Rinkeby network (network_id: 4) through infura. The Deceltralized application (Dapp) will be deployed on Heroku and the source code published on Github.

## ERC20 Token - RPT

The RPT token is used for an ICO, i.e. one can invest in the project by buying the token with ETH, if the transaction is successful, the amount of tokens corresponding to the amout of ethers spent buy the buyer is sent to his wallet. The eth received is not stored in the contract, an account has been provided by the contract's owner where ETH are transfered. This account address must be specified as the unique constructor parameter in the migration file (2_deploy_contract) in **migration** directory.

```javascript
// ICO is the name of the ERC20 token contract

var ICO = artifacts.require("./ICO.sol");

module.exports = function (deployer) {
  deployer.deploy(ICO, "address to transfer ETH from ICO to");
};
```

## ERC721 Token (NFT) - RPNFT

The ERC721 token is used to mint images that are sold on the Dapp either at a fixed price or in auction. In order to be sure not to mint the same image several times, they are store on IPFS [[1]](https://ipfs.io/) that provides in return a unique identifier called CID (content identifier). CIDs describe data not by its location but by its content, this means the same content always results to the same CID, therefore if images are stored on the Ethereum Blockchain through the CIDs, they cannot be duplicated, i.e. the same image cannot be minted twice. Notice that this ipfs proprety is also povided by the ERC721, therefore, even if the image is not stored on IPFS, it would be unique in case it has been created following this standard.

## Configuration file

The truffle react box is used to generate the Dapp structure, this is achieved buy running the command [[2]](https://www.trufflesuite.com/boxes/react) (the name of the project is set to the name of the working directory)

```javascript
npx truffle unbox react
```

Since infura is used to access the Blockchain, one needs to provide the infura API key and the account mnemonic in the configuration file. An _.env_ file is used to store both the key and the mnemonic, this file must be saved in **client/src/** directory, for the mnemonic, Ganache [[3]](https://www.trufflesuite.com/ganache) is used through Metamask [[4]](https://metamask.io/).

```javascript
// .env

REACT_APP_RINKEBY_KEY = "INFURA KEY";
REACT_APP_MNEMONIC = "MNEMONIC";
```

Here is the simple configuration of the _truflle-config.js_ file

```javascript
// truffle-config.js

const path = require("path");
const HDWalletProvider = require("./client/node_modules/@truffle/hdwallet-provider");
require("./client/node_modules/dotenv").config();

const MNEMONIC = process.env.REACT_APP_MNEMONIC;
const RINKEBY_KEY = process.env.REACT_APP_RINKEBY_KEY;

module.exports = {
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: 5777,
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider(
          MNEMONIC,
          `https://rinkeby.infura.io/v3/${RINKEBY_KEY}`
        ),
      network_id: 4,
      gas: 4500000,
    },
  },
  compilers: {
    solc: {
      version: "0.8.4",
    },
  },
};
```

## Results

I this section are displayed screenshots of the Daap that show how it works.

### displaying the minted image ready for sell

![alt text](https://github.com/Edoumou/rareporn-application/blob/main/client/src/img/scr1.png "screeshot")
