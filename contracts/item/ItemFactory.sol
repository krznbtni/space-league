pragma solidity ^0.4.24;

import '../token/ERC20/SpaceLeagueCurrency.sol';
import '../token/ERC721/SpaceLeagueItem.sol';
import '../ownership/Ownable.sol';
import '../../libs/math/SafeMath.sol';

contract ItemFactory is Ownable {
  using SafeMath for uint256;

  uint256 public EXAMPLE_MINT_PRICE = 15;

  address public SPACE_LEAGUE_CURRENCY_ADDRESS;
  address public SPACE_LEAGUE_ITEM_ADDRESS;

  SpaceLeagueCurrency spaceLeagueCurrency = SpaceLeagueCurrency(SPACE_LEAGUE_CURRENCY_ADDRESS);
  SpaceLeagueItem spaceLeagueItem = SpaceLeagueItem(SPACE_LEAGUE_ITEM_ADDRESS);

  struct Item {
    uint8 rarity;
    uint8 attack;
    uint8 defense;
    uint8 energyRegeneration;
    uint8 health;
    uint8 healthRegeneration;
    uint8 strength;
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

  // FOR THIS FUNCTION TO WORK, YOU HAVE TO CALL
  // await SpaceLeagueCurrency.methods.approve(ItemFactory.options.address, EXAMPLE_MINT_PRICE).send({ from: personOne, gas: '100000' });
  // LOOK UP: approveAndCall
  function mintItem() public {
    _mintItem(msg.sender);
  }

  function _mintItem(address _caller) private {
    spaceLeagueCurrency.transferFrom(_caller, address(this), EXAMPLE_MINT_PRICE);

    // add burn

    Item memory _item = Item({
      rarity: 0,
      attack: 0,
      defense: 0,
      energyRegeneration: 0,
      health: 0,
      healthRegeneration: 0,
      strength: 0
    });

    uint256 _itemId = items.push(_item).sub(1);
    spaceLeagueItem.mintByGame(address(this), _caller, _itemId);
  }

  function burnItem(uint256 _itemId) public {
    _burnItem(msg.sender, _itemId);
  }

  function _burnItem(address _owner, uint256 _itemId) private {
    spaceLeagueItem.burnByGame(address(this), _owner, _itemId);
    delete items[_itemId];
  }

  // FOR THIS FUNCTION TO WORK, YOU HAVE TO CALL
  // await SpaceLeagueItem.methods.approve(ItemFactory.options.address, 1).send({ from: personOne, gas: '1000000' });
  function donateItem(address _to, uint256 _itemId) public {
    _donateItem(msg.sender, _to, _itemId);
  }

  function _donateItem(address _from, address _to, uint256 _itemId) private {
    spaceLeagueItem.safeTransferFrom(_from, _to, _itemId);
  }
}