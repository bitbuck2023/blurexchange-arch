const { ethers, upgrades, run, network } = require("hardhat");
const { saveDeployedInfo, deployAndSave, verify, delay } = require("./utils");

require('colors')


async function main() {
    const [deployer] = await ethers.getSigners();

    const BlurSwap = await ethers.getContractFactory("BlurSwap");
    // address _marketRegistry, address _guardian
    const BlurSwapRet = await BlurSwap.deploy(deployer.address, deployer.address)
    await BlurSwapRet.deployed()

    await delay();

    await verify(BlurSwapRet.address)
    await saveDeployedInfo('BlurSwap', BlurSwapRet)
    console.log('BlurSwap verify finish')
}

// main().catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// });

module.exports = {
    main
}