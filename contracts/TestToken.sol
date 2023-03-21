// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// ERC20 token contract
contract TestToken is ERC20 {
    uint256 SUPPLY = 100000000 * 10**18;
    constructor(address bank) ERC20('TestToken', 'TestToken') {
        _mint(bank, SUPPLY);
    }
}