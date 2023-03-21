#! /bin/bash
echo "Start test $1";
export PROJECT_PATH=$(pwd)
# npx hardhat clean
npx hardhat test