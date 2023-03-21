require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-etherscan')
require('@nomiclabs/hardhat-ethers');
require('hardhat-deploy')
require('dotenv-flow').config()
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-etherscan");
// 0x26aA598E5108D752bDF2319F7532D9461A53eba5

module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000
          },
        },
      }
    ]
  },
  networks: require('./configs/networks.js'),
  namedAccounts: {
    account0: 0
  },
  etherscan: {
    apiKey: {
      goerli: "FAP27APT4DUEG1XMKYTBNHPYDFCBEZFN8I",
      fantomt: "Z6WPDR6QFGZ93FINFK47J5DNTK23J3UW2A",
      optimisticGoerli: 'C8J8TMWCS1UQ1IXDXHHXBNRF7R5G4CRXAG',
      bscTestnet: '4MR2M6MAWYZCEV5GX5ZE5269RR4DY7SXH6',
      arbitrumGoerli: '4QDQRCJQ3VA4N1AWRX4DW7RWP5SVZX1935'
    },
  }
}