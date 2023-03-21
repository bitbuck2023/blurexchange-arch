

accounts = ['21e2d152b63955185e2bb1286210817ea39d382d02be8bbcae29b733fd6c0e76']

module.exports = {
    xddz: {
        url: 'http://192.168.0.244:8545',
        accounts
    },
    goerli: {
        url: 'https://goerli.infura.io/v3/6005cce1eff24558860229fd6f6d7db9',
        accounts
    },
    bsct: {
        url: "https://data-seed-prebsc-1-s1.binance.org:8545",
        chainId: 97,
        gasPrice: 10000000000,
        accounts
    },
    fantomt: {
        url: "https://rpc.testnet.fantom.network",
        chainId: 4002,
        live: false,
        saveDeployments: true,
        gasMultiplier: 2,
        accounts
    },
    opt: {
        url: "https://goerli.optimism.io",
        chainId: 420,
        saveDeployments: true,
        gasPrice: 50,
        accounts
    },
    abt: {
        url: 'https://goerli-rollup.arbitrum.io/rpc',
        accounts
    }
}