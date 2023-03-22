// simple Express server
const express = require('express');
const ethers = require('ethers');
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");

const app = express();
const port = 30001;
// accept cors use cors library
const cors = require('cors');
const errorHandler = (error, request, response, next) => {
    console.error(error)
    const status = error.status || 400
    response.status(status).send(error.message)
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler)
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const ms = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} ${res.statusMessage} - ${ms}ms`);
    });
    next();
});

const CONTRACT_DIR = '../contract_deployed';
const NETWORK_NAME = 'abt';
const contractDeployed = require(`${CONTRACT_DIR}/deployed.json`);
const abi = new ethers.utils.AbiCoder();

const { Order, Fee, OracleOrder } = require('./libs/order_structs.js');
const SIGN_TYPES_ORACLE = { OracleOrder, Order, Fee }

const networkConfig = require('../configs/networks.js')[NETWORK_NAME];
const oracleAccount = networkConfig['accounts'][0]
const provider = new ethers.providers.JsonRpcProvider(networkConfig['url']);
const oracleSigner = new ethers.Wallet(oracleAccount, provider);
let BlurExchangeProxy = null;
let DOMAIN_VALUE = null;
ethers.getContractAt("BlurExchange", await getContractAddress('BlurExchangeProxy')).then((contract) => {
    console.log('contract initialized')
    BlurExchangeProxy = contract;
    DOMAIN_VALUE = {
        name: "Blur Exchange",
        version: "1",
        chainId: provider.network.config.chainId,
        verifyingContract: BlurExchangeProxy.address
    }
});

async function signOneOrder(order, signer) {
    const blockNumber = provider.getBlockNumber();
    let signature = await signer._signTypedData(DOMAIN_VALUE, SIGN_TYPES_ORACLE, { order, blockNumber })

    const r = signature.slice(0, 66);
    const s = "0x" + signature.slice(66, 130);
    const v = parseInt(signature.slice(130, 132), 16);

    const abi = new ethers.utils.AbiCoder();
    const rsv = abi.encode(["uint8", "bytes32", "bytes32"], [v, r, s]);

    console.log({ signature, r, s, v, rsv, blockNumber });

    return { signature, r, s, v, rsv, blockNumber }
}

app.post('/sign_oracle', async (req, res) => {
    let body = req.body;

    let order = body;
    await fillInfo(order);
    let sign = await signOneOrder(order, oracleSigner);

    res.json({
        signature: sign,
        body
    });
});


async function fillInfo(order) {
    if (!order.salt) {
        order.salt = random() * 100000;
    }
    if (!order.blockNumber) {
        order.blockNumber = await provider.getBlockNumber();
    }
}

async function signOrderWithMerklepath(merklePath, order) {
    console.log(order)
    let sign = await signer._signTypedData(SIGN_DOMAIN, SIGN_TYPES, order)

    const r = sign.slice(0, 66);
    const s = "0x" + sign.slice(66, 130);
    const v = parseInt(sign.slice(130, 132), 16);
    const rsv = abi.encode(['bytes32[]', "uint8", "bytes32", "bytes32"], [merklePath, v, r, s]);

    return rsv;
}

app.post('/getpolicies', async (req, res) => {
    res.json({
        StandardPolicyERC721: contractDeployed[NETWORK_NAME]['StandardPolicyERC721'],
        StandardPolicyERC721Oracle: contractDeployed[NETWORK_NAME]['StandardPolicyERC1155'],
        StandardPolicyERC721Oracle: contractDeployed[NETWORK_NAME]['StandardPolicyERC1155'],
    });
})

app.post('/sign_bulk', async (req, res) => {
    let orderList = req.body;

    let signObjList = await Promise.all(orderList.map(async (order) => {
        await fillInfo(order);
        const order_hash = ethers.utils._TypedDataEncoder.hash(SIGN_DOMAIN, SIGN_TYPES, value)

        return {
            order_hash,
            body: order
        }
    }))
    let hashList = signObjList.map((signObj) => {
        return signObj.order_hash
    })
    // generate merkle tree
    let tree = new MerkleTree(hashList, keccak256, { sortPairs: true });
    let root = tree.getHexRoot();
    let ret = signObjList.map((signObj) => {
        let proof = tree.getHexProof(signObj.order_hash);
        signObj['proof'] = proof;
        signObj['root'] = root;
        signObj['signature'] = signOrderWithMerklepath(proof, signObj.body);
        return signObj;
    })

    res.json(ret);
});



app.get('/', (req, res) => {
    res.json({
        message: 'hello from nft sign server'
    });
});

const listener = app.listen(port, '0.0.0.0', () => {
    console.log('Your app is listening on port ' + listener.address().port);
});
