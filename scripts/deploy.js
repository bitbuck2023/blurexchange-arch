const { ethers, upgrades, run, network } = require("hardhat");
const { saveDeployedInfo, deployAndSave, verify, delay } = require("./utils");
require('colors')

async function deployLibs() {
    const ret = {}
    const MerkleVerifier = await ethers.getContractFactory("MerkleVerifier");
    ret['MerkleVerifier'] = (await (await MerkleVerifier.deploy()).deployed()).address;
    return ret;
}

async function main() {
    const [deployer] = await ethers.getSigners();
    const PolicyManagerRet = await deployAndSave('PolicyManager')
    const ExecutionDelegateRet = await deployAndSave('ExecutionDelegate')

    const BlurExchange = await ethers.getContractFactory("BlurExchange", {
        libraries: await deployLibs()
    });
    const blockRange = 30
    const BlurExchangeProxy = await upgrades.deployProxy(
        BlurExchange,
        [
            ExecutionDelegateRet.address,
            PolicyManagerRet.address,
            deployer.address,
            blockRange
        ],
        {
            unsafeAllowLinkedLibraries: true,
            initializer: "initialize",
            unsafeAllow: ['constructor', 'POOL']
        });
    await BlurExchangeProxy.deployed();

    // 给ExecutionDelegateRet加exchange白名单
    await (await ExecutionDelegateRet.approveContract(BlurExchangeProxy.address)).wait()
    console.log('BlurExchangeProxy address', BlurExchangeProxy.address)
    saveDeployedInfo('BlurExchangeProxy', BlurExchangeProxy)
    
    await delay();

    await verify(PolicyManagerRet.address)
    console.log('PolicyManager verify finish')
    await verify(ExecutionDelegateRet.address)
    console.log('ExecutionDelegate verify finish')
    await verify(BlurExchangeProxy.address)
    console.log('BlurExchangeProxy verify finish')

    await BlurExchangeProxy.changePool('0xe3116C277377703447F6F5B30Ca260BC109bA7cD')
    console.log('deployed finish')
}

// main().catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// });

module.exports = {
    main
}