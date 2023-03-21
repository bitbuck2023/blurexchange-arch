const { ethers, upgrades, run, network } = require("hardhat");
const { deployAndSave, delay, getContractAddress } = require("./utils");
const { verify } = require("./utils");
require('colors')

async function main() {
    const manager = await ethers.getContractAt("PolicyManager", await getContractAddress('PolicyManager'));

    console.log('manager', manager.address)
    let policyList = ['StandardPolicyERC721', 'StandardPolicyERC721Oracle', 'SafeCollectionBidPolicyERC721']
    for (let i = 0; i < policyList.length; i++) {
        console.log('start deploy policy', policyList[i])
        let policyName = policyList[i]
        const deployRet = await deployAndSave(policyName)
        console.log('deployed policy', policyName, deployRet.address)
        await delay();
        deployAddress = deployRet.address
        await (await manager.addPolicy(deployAddress)).wait()
        await verify(deployAddress)
    }
    console.log('deployed finish', 'addPolicy')
}

// main().catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// });

module.exports = {
    main
}