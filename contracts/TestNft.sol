// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

// create a NFT named TestNft
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestNft is ERC721 {
    constructor() ERC721("TestNft", "TNFT") {}

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function burn(uint256 tokenId) external {
        _burn(tokenId);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://live---metadata-5covpqijaa-uc.a.run.app/metadata/";
    }
}