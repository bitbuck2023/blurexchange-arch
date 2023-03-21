const { ethers, upgrades, run, network } = require("hardhat");
var fs = require('fs');

const VERIFY_DELAY_TIME = 10

const NO_VERIFY_NETWORK = ['xddz', 'hardhat']

const DEPLOYED_PATH = process.env.PROJECT_PATH + '/contract_deployed/deployed.json'

async function saveDeployedInfo(name, deployedRet) {
    let contractName = name
    console.log("Save success".green, contractName.blue, deployedRet.address);
    if(!fs.existsSync('./contract_deployed')){
        fs.mkdirSync('./contract_deployed')
    }
    if(!fs.existsSync(DEPLOYED_PATH)){
        fs.writeFileSync(DEPLOYED_PATH, '{}', 'utf8', 'w+')
    }
    let origin = fs.readFileSync(DEPLOYED_PATH, 'utf8', 'r')
    if(!origin){
        origin = {}
    } else {
        origin = JSON.parse(origin)
    }
    if(!origin[network.name]) {
        origin[network.name] = {}
    }
    origin[network.name][contractName] = deployedRet.address
    fs.writeFileSync(DEPLOYED_PATH, JSON.stringify(origin), 'utf8', 'w+')
    let abiDir = `./contract_deployed/abi/${network.name}`
    if(!fs.existsSync(abiDir)){
        fs.mkdirSync(abiDir, {recursive: true})
    }
    fs.writeFileSync(abiDir + '/' + contractName + '.json', deployedRet.interface.format('json'), 'utf8', 'w+')
}

async function deployAndSave(name){
    const Contract = await ethers.getContractFactory(name);
    const ContractRet = await Contract.deploy()
    await ContractRet.deployed()
    console.log('Deplyed success'.green, name.blue, ContractRet.address)
    await saveDeployedInfo(name, ContractRet)
    return ContractRet
}

async function getContractAddress(name){
    return require(DEPLOYED_PATH)[network.name][name]
}

async function delay(timeSeconds){
    if(NO_VERIFY_NETWORK.includes(network.name)){
        console.log('No need sleep'.red, network.name);
        return
    }

    if(!timeSeconds){
        timeSeconds = VERIFY_DELAY_TIME
    }

    console.log('sleep', timeSeconds);
    // countdown progress bar
    for (let i = 0; i < timeSeconds; i++) {
        process.stdout.write('\r');
        process.stdout.write(`${i+1}/${timeSeconds}`);
        await new Promise(r => setTimeout(r, 1000));
    }
}

async function verify(cAddress) {
    if(NO_VERIFY_NETWORK.includes(network.name)){
        console.log('No need verify'.red, network.name);
        return
    }
    try{
        await run("verify:verify", {
            address: cAddress,
            constructorArguments: [],
          });
    } catch (e) {
        console.log('Verify error'.red, e.toString())
    }
}

// exports
module.exports = {
    deployAndSave,
    saveDeployedInfo,
    verify,
    delay,
    getContractAddress
}