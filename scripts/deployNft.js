const { ethers, upgrades, run, network } = require("hardhat");
const { saveDeployedInfo, deployAndSave, delay } = require("./utils");
const {verify } = require("./utils");
require('colors')

async function main() {
    const TestNftRet = await deployAndSave('TestNft')

    await delay();

    await verify(TestNftRet.address)
    console.log('TestNft verify finish')
    console.log('deployed finish')
}

// main().catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// });

module.exports = {
    main
}