// The configuration details for the public key API
import {Transaction} from 'ethereumjs-tx';

let networkList = {
    ropsten: {
        name: 'ropsten',
        id: 3
    },
    mainnet: {
        name: 'mainnet',
        id: 1
    },
    rinkeby: {
        name: 'rinkeby',
        id: 4
    },
    goerli: {
        name: 'goerli',
        id: 5
    },
    kovan: {
        name: 'kovan',
        id: 42
    },
};

export const lookupPubkey = async (web3, address) => {
    console.log('WEB3: ', web3.givenProvider.networkVersion);
    let network;
    switch (web3.givenProvider.networkVersion) {
        case "1":
            network = networkList.mainnet
            break
        case "3":
            network = networkList.ropsten
            break
        case "4":
            network = networkList.rinkeby
            break
        case "5":
            network = networkList.goerli
            break
        case "42":
            network = networkList.kovan
            break
        default:
            network = networkList.mainnet
    }
    try {
        const transactions = await fetch(`https://api-${network.name}.etherscan.io/api?module=account&action=txlist&address=${address}&sort=desc&offset=2`);
        const txs = await transactions.json();
        const latestTx = txs.result[0]
        const txHash = latestTx.hash;
        const tx = await web3.eth.getTransaction(txHash);
        const pubKey = new Transaction({
            nonce: tx.nonce,
            gasPrice: `0x${tx.gasPrice.toString(16)}`,
            gasLimit: tx.gas,
            to: tx.to,
            value: `0x${tx.value.toString(16)}`,
            data: tx.input,
            r: tx.r,
            s: tx.s,
            v: tx.v,
        },{ chain: network.name }).getSenderPublicKey();

        console.log(pubKey.toString('hex'))
        return {publicKey: pubKey}
    } catch(e) {
        return e;
    }
}

export default lookupPubkey;
