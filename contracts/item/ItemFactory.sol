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
    uint8 attack;
    uint8 defense;
    uint8 durability;
    uint8 energyRegeneration;
    uint8 health;
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

  // Now for step 4:
  // 4.1 My server will log all blocks. When a block arrives that contains a minting, the server will separately call spaceLeagueToken.methods.transferFrom().
  // 4.2 Our result variable will be the value of rng(blockNumber)
  // 4.3 The server calls ERC721.mint with result and user as paramters.(ändrad)
  uint8 public constant COMMON = 69; // 1-2 properties
  uint8 public constant UNCOMMON = 18; // 3-4 properties
  uint8 public constant RARE = 9; // 5-6 properties
  uint8 public constant MYTHICAL = 3; // 7-8 properties
  uint8 public constant LEGENDARY = 1; // 8+ properties

  uint8 public constant BLOCK_OFFSET = 1;
  uint256 mintQueue;

  mapping (address => mapping(uint256 => uint256)) internal blocksToCheck;

  event OnBuyItem(address buyer, address spender, uint256 value);

  // HAS TO BE CALLED SEPARATELY: spaceLeagueCurrency.approve(address(this), EXAMPLE_MINT_PRICE);
  function buyItem() public {
    blocksToCheck[msg.sender][mintQueue++] = block.number + BLOCK_OFFSET;
    spaceLeagueCurrency.transferFrom(msg.sender, address(this), EXAMPLE_MINT_PRICE);
    emit OnBuyItem(msg.sender, address(this), EXAMPLE_MINT_PRICE);
  }
}