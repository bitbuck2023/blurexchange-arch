module.exports = {
    Order: [
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
    ],
    Fee: [
        { name: "recipient", type: "address" },
        { name: "rate", type: "uint256" },
    ],
    Side: {
        BUY: 0,
        SELL: 1
    }
}