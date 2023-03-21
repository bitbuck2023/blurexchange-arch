const { ethers, upgrades, run, network } = require("hardhat");
const { saveDeployedInfo, deployAndSave, verify, delay, getContractAddress } = require("./utils");
require('colors')

async function main() {
    const BlurPool = await ethers.getContractFactory("BlurPool");
    const BlurPoolProxyRet = await upgrades.deployProxy(
        BlurPool,
        [],
        {
            unsafeAllowLinkedLibraries: true,
            initializer: "initialize",
            unsafeAllow: ['constructor']
        });
    await BlurPoolProxyRet.deployed();
    console.log('BlurPoolProxy address', BlurPoolProxyRet.address)
    saveDeployedInfo('BlurPoolProxy', BlurPoolProxyRet)
    await BlurPoolProxyRet.setExchange(getContractAddress('BlurExchangeProxy'))
    await BlurPoolProxyRet.setSwap(getContractAddress('BlurSwap'))

    await delay();
    await verify(BlurPoolProxyRet.address)
}

// main().catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// });

module.exports = {
    main
}