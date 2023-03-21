#! /bin/bash
echo "Deploying to $1";
export PROJECT_PATH=$(pwd)
npx hardhat run --network $1 scripts/deployAll.js