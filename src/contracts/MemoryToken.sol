// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MemoryToken is ERC721URIStorage { 
  using Counters for Counters.Counter;
  Counters.Counter public _tokenIds;

  constructor() ERC721("Memory Token", "DACETHER")  {}

  function awardItem(address player, string memory tokenURI) public returns (uint256) {
    uint256 newItemId = _tokenIds.current();
    _mint(player, newItemId);
    _setTokenURI(newItemId, tokenURI);

    _tokenIds.increment();
    return newItemId;
  }
}
