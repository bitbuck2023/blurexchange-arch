const { expect, assert } = require("chai");
const { ethers, network } = require("hardhat");
const { main: deployExchange } = require('../scripts/deploy')
const { main: addPolicy } = require('../scripts/addPolicy')
const { main: deploySwap } = require('../scripts/deploySwap')
const { main: deployPool } = require('../scripts/deployPool')
const {getContractAddress} = require('../scripts/utils')
const { arrayify, BytesLike, hexConcat, hexlify, hexZeroPad, isHexString } = require("@ethersproject/bytes");


const Order = [
    { name: "trader", type: "address" },
    { name: "side", type: "uint8" },
    { name: "matchingPolicy", type: "address" },
    { name: "collection", type: "address" },
    { name: "tokenId", type: "uint256" },
    { name: "amount", type: "uint256" },
    { name: "paymentToken", type: "address" },
    { name: "price", type: "uint256" },
    { name: "listingTime", type: "uint256" },
    { name: "expirationTime", type: "uint256" },
    { name: "fees", type: "Fee[]" },
    { name: "salt", type: "uint256" },
    { name: "extraParams", type: "bytes" },
    { name: "nonce", type: "uint256" },
]
const Fee = [
    { name: "rate", type: "uint16" },
    { name: "recipient", type: "address" },
]

const OracleOrder = [
    { name: "order", type: "Order" },
    { name: "blockNumber", type: "uint256" },
]

/**
 * 
 * @param {*} BlurExchangeProxy 
 * @param {*} order 
 * @param {ethers.wallet} signer 
 * @returns 
 */
async function signOrder(BlurExchangeProxy, order, signer){
    const domain = {
        name: "BlurExchange",
        version: "1.0",
        chainId: network.config.chainId,
        verifyingContract: BlurExchangeProxy.address
    }

    console.log('domain', domain)
    let signature = await signer._signTypedData(domain, { Order, Fee }, order)
    let hash =  ethers.utils._TypedDataEncoder.hash(domain, { Order, Fee }, order)
    console.log('hash', hash)

    const r = signature.slice(0, 66);
    const s = "0x" + signature.slice(66, 130);
    const v = parseInt(signature.slice(130, 132), 16);

    const abi = new ethers.utils.AbiCoder();
    const rsv = abi.encode(["uint8", "bytes32", "bytes32"], [v, r, s]);

    const blockNumber = await ethers.provider.getBlockNumber();
    console.log({signature, r, s, v, rsv, blockNumber});

    return {signature, r, s, v, rsv, blockNumber}
}

async function signOracleOrder(BlurExchangeProxy, order, signer){
    const domain = {
        name: "BlurExchange",
        version: "1.0",
        chainId: network.config.chainId,
        verifyingContract: BlurExchangeProxy.address
    }

    const blockNumber = await ethers.provider.getBlockNumber();
    console.log('domain', domain)
    let signature = await signer._signTypedData(domain, { OracleOrder, Order, Fee }, {order, blockNumber})

    // order.ex
    // let typesEncoderOrder = ethers.utils._TypedDataEncoder.from({Order, Fee })
    // let orderEncode =  typesEncoderOrder.encode(order)
    // let nuanceEncode = ethers.utils.defaultAbiCoder.encode(['uint'], [0])
    // let concatHex = hexConcat([orderEncode, nuanceEncode])
    // let newHash = ethers.utils.keccak256(concatHex)
    // console.log({ orderEncode, nuanceEncode, concatHex, newHash})
    // let orderHash =  ethers.utils._TypedDataEncoder.hash(domain, { Order, Fee }, order)
    // console.log('orderHash', orderHash)

    const r = signature.slice(0, 66);
    const s = "0x" + signature.slice(66, 130);
    const v = parseInt(signature.slice(130, 132), 16);

    const abi = new ethers.utils.AbiCoder();
    const rsv = abi.encode(["uint8", "bytes32", "bytes32"], [v, r, s]);

    console.log({signature, r, s, v, rsv, blockNumber});

    return {signature, r, s, v, rsv, blockNumber}
}

const mock_order = {
    trader: "0x97b43255227669684ef5c586958044b6a8a17fe2",
    side: "0",
    matchingPolicy: "0x0000000000b92d5d043faf7cecf7e2ee6aaed232",
    collection: "0xeb3a9a839dfeeaf71db1b4ed6a8ae0ccb171b227",
    tokenId: "0",
    amount: "1",
    paymentToken: "0x0000000000a39bb272e79075ade125fd351887ac",
    price: ethers.utils.parseEther("0.1"),
    listingTime: "1677496669",
    expirationTime: "1709032668",
    fees: [],
    extraParams: '0x01', // 表示需要服务端预言机签名
    salt: "1",
    nonce: "0",
}

describe("BlurExchange contract", function () {

    async function deploy() {
        await deployExchange()
        await addPolicy()
        await deploySwap()
        await deployPool()
    }


    it("Test sign from oracle and sell", async function () {
        await deploy()
        const [owner, user2] = await ethers.getSigners();
        let BlurExchangeProxy = await ethers.getContractAt("BlurExchange", await getContractAddress('BlurExchangeProxy'));
        
        let mock_order_sell = JSON.parse(JSON.stringify(mock_order))
        mock_order_sell.side ='1'
        mock_order_sell.extraParams = '0x00'
        let sellInfo = await signOracleOrder(BlurExchangeProxy, mock_order_sell, owner)

        let ret = await BlurExchangeProxy.testVerifyOracle({
            order: mock_order_sell,
            v: sellInfo.v,
            r: sellInfo.r,
            s: sellInfo.s,
            extraSignature: sellInfo.rsv,
            signatureVersion: 0,
            blockNumber: sellInfo.blockNumber,
        })
        // ret = false;
        expect(ret).to.equal(true)
    });

    it("Test sign from user buy", async function () {
        await deploy()
        const [owner, user2] = await ethers.getSigners();
        let BlurExchangeProxy = await ethers.getContractAt("BlurExchange", await getContractAddress('BlurExchangeProxy'));
        
        let mock_order_buy = JSON.parse(JSON.stringify(mock_order))
        mock_order_buy.side ='0'
        mock_order_buy.trader = user2.address
        let buyInfo = await signOrder(BlurExchangeProxy, mock_order_buy, user2)
        console.log('user2', user2.address)

        // buyInfo.rsv 这个值单个订单和批量订单不一样

        let ret = await BlurExchangeProxy.testVerifyUser({
            order: mock_order_buy,
            v: buyInfo.v,
            r: buyInfo.r,
            s: buyInfo.s,
            extraSignature: buyInfo.rsv,
            signatureVersion: 0,
            blockNumber: buyInfo.blockNumber,
        })
        expect(ret).to.equal(true)
    });

    it("Test excute", async function () {
        const [owner, buyer, seller] = await ethers.getSigners();
        await deploy()

        let NftTokendeployer = await ethers.getContractFactory("TestNft")
        let nftToken = await NftTokendeployer.deploy()
        const testTokenId = 11;
        await (await nftToken.mint(seller.address, testTokenId)).wait()

        const nftTokenWithSigner = nftToken.connect(seller);
        let BlurExchangeProxy = await ethers.getContractAt("BlurExchange", await getContractAddress('BlurExchangeProxy'), buyer);
        let ExecutionDelegate = await ethers.getContractAt("ExecutionDelegate", await getContractAddress('ExecutionDelegate'), owner);

        // 授权交易所可以操作nft
        const transferContractAddress = ExecutionDelegate.address
        await (await nftTokenWithSigner.approve(transferContractAddress, testTokenId)).wait()
        console.log('approve', await nftTokenWithSigner.getApproved(testTokenId), transferContractAddress)

        let PolicyManager = await ethers.getContractAt("PolicyManager", await getContractAddress('PolicyManager'));

        console.log('get all policy', await PolicyManager.viewWhitelistedPolicies(0, 10))
        mock_order.matchingPolicy = await getContractAddress('StandardPolicyERC721')
        mock_order.paymentToken = '0x0000000000000000000000000000000000000000' // 表示使用eth
        mock_order.tokenId = testTokenId
        mock_order.collection = nftToken.address
        console.log('deployed policy StandardPolicyERC721', mock_order.policy)

        // cloneObject
        let mock_order_buy = JSON.parse(JSON.stringify(mock_order))
        mock_order_buy.side ='0'
        mock_order_buy.trader = buyer.address
        let buyOracleInfo = await signOracleOrder(BlurExchangeProxy, mock_order_buy, owner)
        let buyInfo = await signOrder(BlurExchangeProxy, mock_order_buy, buyer)
        console.log('buyer', buyer.address)

        let mock_order_sell = JSON.parse(JSON.stringify(mock_order))
        mock_order_sell.side ='1'
        mock_order_sell.trader = seller.address
        let sellOracleInfo = await signOracleOrder(BlurExchangeProxy, mock_order_sell, owner)
        let sellInfo = await signOrder(BlurExchangeProxy, mock_order_sell, seller)
        
        // 卖单，oracle用的extraSignature去校验签名，用rsv校验卖单用户签名所以需要两个签名
        
        console.log('enter testExecute sell', sellInfo)
        console.log('oracle address', owner.address)
        await BlurExchangeProxy.testExecute({
            order: mock_order_sell,
            v: sellInfo.v,
            r: sellInfo.r,
            s: sellInfo.s,
            extraSignature: sellOracleInfo.rsv,
            signatureVersion: 0,
            blockNumber: sellInfo.blockNumber,
        }, {
            order: mock_order_buy,
            v: buyInfo.v,
            r: buyInfo.r,
            s: buyInfo.s,
            extraSignature: buyOracleInfo.rsv,
            signatureVersion: 0,
            blockNumber: buyInfo.blockNumber,
        }, '7', {value: ethers.utils.parseEther("0.1")})

        expect(await nftToken.ownerOf(testTokenId)).to.equal(buyer.address)
    });
});