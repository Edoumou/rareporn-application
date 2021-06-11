import ICO from './contracts/ICO.json';

async function getICOContract(web3) {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = ICO.networks[networkId];
    const contract = new web3.eth.Contract(
        ICO.abi,
        deployedNetwork && deployedNetwork.address
    );

    return contract;
}

export default getICOContract;