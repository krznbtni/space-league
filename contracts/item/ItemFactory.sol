pragma solidity ^0.4.24;

import '../token/ERC20/SpaceLeagueToken.sol';
import '../token/ERC721/ERC721Token.sol';
import '../ownership/Ownable.sol';
import '../../libs/math/SafeMath.sol';

contract ItemFactory is Ownable {
  using SafeMath for uint256;

  uint256 EXAMPLE_MINT_PRICE = 15;

  address public SPACE_LEAGUE_TOKEN_ADDRESS;
  address public ERC721_TOKEN_ADDRESS;

  SpaceLeagueToken spaceLeagueToken = SpaceLeagueToken(SPACE_LEAGUE_TOKEN_ADDRESS);
  ERC721Token erc721 = ERC721Token(ERC721_TOKEN_ADDRESS);

  struct Item {
    uint8 attackSpeed;
  }

  Item[] public items;

  function setSpaceLeagueTokenAddress(address _contractAddress) public onlyOwner {
    SPACE_LEAGUE_TOKEN_ADDRESS = _contractAddress;
  }

  function setERC721Address(address _contractAddress) public onlyOwner {
    ERC721_TOKEN_ADDRESS = _contractAddress;
  }

  function mintItem() public {
    _mintItem(msg.sender);
  }

  function _mintItem(address _caller) private {
    spaceLeagueToken.transferFrom(_caller, address(this), EXAMPLE_MINT_PRICE);

    // burnPercentage might cause a problem?
    spaceLeagueToken.burnByGame(EXAMPLE_MINT_PRICE);

    Item memory _item = Item({
      attackSpeed: 1
    });

    uint256 _itemId = items.push(_item).sub(1);
    erc721.mintByGame(address(this), _caller, _itemId);
  }

  function burnItem(uint256 _itemId) public {
    delete items[_itemId];
    erc721.burnByGame(address(this), msg.sender, _itemId);
  }

  function giveItem(address _to, uint256 _tokenId) public {
    erc721.transferFrom(msg.sender, _to, _tokenId);
  }

  // TODO: Disenchant
}