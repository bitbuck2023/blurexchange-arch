const { main: deployExchange } = require('../scripts/deploy')
const { main: addPolicy } = require('../scripts/addPolicy')
const { main: deploySwap } = require('../scripts/deploySwap')
const { main: deployPool } = require('../scripts/deployPool')

(async function deployAll(){
    await deployExchange()
    await new Promise(r => setTimeout(r, 5000));
    await addPolicy()
    await new Promise(r => setTimeout(r, 5000));
    await deploySwap()
    await new Promise(r => setTimeout(r, 5000));
    await deployPool()
    await new Promise(r => setTimeout(r, 5000));
})().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});