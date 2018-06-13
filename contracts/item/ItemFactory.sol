pragma solidity ^0.4.24;

import '../token/ERC20/SpaceLeagueCurrency.sol';
import '../token/ERC721/SpaceLeagueItem.sol';
import '../ownership/Ownable.sol';
import '../../libs/math/SafeMath.sol';

contract ItemFactory is Ownable {
  using SafeMath for uint256;

  uint256 EXAMPLE_MINT_PRICE = 15;

  address public SPACE_LEAGUE_CURRENCY_ADDRESS;
  address public SPACE_LEAGUE_ITEM_ADDRESS;

  SpaceLeagueCurrency spaceLeagueCurrency = SpaceLeagueCurrency(SPACE_LEAGUE_CURRENCY_ADDRESS);
  SpaceLeagueItem spaceLeagueItem = SpaceLeagueItem(SPACE_LEAGUE_ITEM_ADDRESS);

  struct Item {
    uint8 attackSpeed;
  }

  Item[] public items;

  constructor(address _spaceLeagueCurrency, address _spaceLeagueItem) public {
    SPACE_LEAGUE_CURRENCY_ADDRESS = _spaceLeagueCurrency;
    SPACE_LEAGUE_ITEM_ADDRESS = _spaceLeagueItem;
    spaceLeagueCurrency = SpaceLeagueCurrency(SPACE_LEAGUE_CURRENCY_ADDRESS);
    spaceLeagueItem = SpaceLeagueItem(SPACE_LEAGUE_ITEM_ADDRESS);
  }

  function setSpaceLeagueCurrencyAddress(address _spaceLeagueCurrency) public onlyOwner {
    SPACE_LEAGUE_CURRENCY_ADDRESS = _spaceLeagueCurrency;
    spaceLeagueCurrency = SpaceLeagueCurrency(SPACE_LEAGUE_CURRENCY_ADDRESS);
  }

  function setERC721Address(address _spaceLeagueItem) public onlyOwner {
    SPACE_LEAGUE_ITEM_ADDRESS = _spaceLeagueItem;
    spaceLeagueItem = SpaceLeagueItem(SPACE_LEAGUE_ITEM_ADDRESS);
  }

  function mintItem() public {
    _mintItem(msg.sender);
  }

  function _mintItem(address _caller) private {
    spaceLeagueCurrency.approve(address(this), EXAMPLE_MINT_PRICE);
    spaceLeagueCurrency.transferFrom(_caller, address(this), EXAMPLE_MINT_PRICE);

    // // burnPercentage might cause a problem?
    // spaceLeagueCurrency.burnByGame(EXAMPLE_MINT_PRICE);

    Item memory _item = Item({
      attackSpeed: 1
    });

    uint256 _itemId = items.push(_item).sub(1);
    spaceLeagueItem.mintByGame(address(this), _caller, _itemId);
  }

  function burnItem(uint256 _itemId) public {
    delete items[_itemId];
    spaceLeagueItem.burnByGame(address(this), msg.sender, _itemId);
  }

  function giveItem(address _to, uint256 _tokenId) public {
    spaceLeagueItem.transferFrom(msg.sender, _to, _tokenId);
  }
}