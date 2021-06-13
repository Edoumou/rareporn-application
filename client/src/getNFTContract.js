import NFT from './contracts/ImageNFT.json';

async function getNFTContract(web3) {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = NFT.networks[networkId];
    const contract = new web3.eth.Contract(
        NFT.abi,
        deployedNetwork && deployedNetwork.address
    );

    return contract;
}

export default getNFTContract;