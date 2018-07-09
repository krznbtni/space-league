pragma solidity ^0.4.24;

import '../token/ERC20/SpaceLeagueCurrency.sol';
import '../token/ERC721/ItemERC721.sol';
import '../ownership/Ownable.sol';
import '../../libs/math/SafeMath.sol';

contract ItemFactory is Ownable {
  using SafeMath for uint256;

  SpaceLeagueCurrency public SPC;

  uint8 public constant COMMON = 69; // 1-2 properties
  uint8 public constant UNCOMMON = 18; // 3-4 properties
  uint8 public constant RARE = 9; // 5-6 properties
  uint8 public constant MYTHICAL = 3; // 7-8 properties
  uint8 public constant LEGENDARY = 1; // 8-10 properties
  uint8 public BLOCK_OFFSET = 1;
  uint104 public EXAMPLE_MINT_PRICE = 15;
  uint256 nonce;

  event OnBuyItem(uint256 indexed blockNumber, address indexed player);

  // The properties can be data packed later on.
  struct Item {
    uint8 prop1;
    uint8 prop2;
    uint8 prop3;
    uint8 prop4;
    uint8 prop5;
    uint8 prop6;
    uint8 prop7;
    uint8 prop8;
    uint8 prop9;
    uint8 prop10;
    uint8 prop11;
    uint8 prop12;
    uint8 prop13;
    uint8 prop14;
  }

  Item[] public items;

  constructor(SpaceLeagueCurrency _spcAddress) public {
    SPC = _spcAddress;
  }

  function setSPC(SpaceLeagueCurrency _spcAddress) public {
    SPC = _spcAddress;
  }

  function buyItem() public {
    _buyItem(msg.sender);
  }

  // HAS TO BE CALLED SEPARATELY: spaceLeagueCurrency.approve
  function _buyItem(address _player) private {
    SPC.transferFrom(_player, address(this), EXAMPLE_MINT_PRICE);
    emit OnBuyItem((block.number + BLOCK_OFFSET), _player);
  }

  /// @dev Roll number between two specific values.
  /// @param _blockNumber used for salting.
  /// @param _player player address. Used for salting.
  /// @param _min minimum value.
  /// @param _max maximum value.
  /// @return result rolled number.
  function _roll(uint256 _blockNumber, address _player, uint256 _min, uint256 _max) private returns (uint256 result) {
    require(_min < _max);

    // will be moved at a later time. So this function can be a view modifier.
    nonce++;

    uint256 rand = uint256(
      keccak256(abi.encodePacked(blockhash(_blockNumber), _player, nonce))
    );

    return result = _min + (rand % ((_max - _min) + 1));
  }

  /// @dev Roll which props the item will have.
  /// @param _blockNumber used for salting.
  /// @param _player player address. Used for salting.
  /// @param _numberOfProps the amount of numbers to generate.
  function _rollMultiple(uint256 _blockNumber, address _player, uint256 _numberOfProps) private returns (uint256[]) {
    uint256 count = _numberOfProps;
    
    // Create an in memory array to store props
    uint256[] memory props = new uint256[](15); // 15 slot array because we have 15 props.

    do {
      uint256 index = _roll(_blockNumber, _player, 0, 14); // 0-14 because we have 15 props in total.

      if (props[index] == 0) {
        props[index] = 1;
        count--;
      }

    } while (0 < count);

    return props;
  }

  /// @dev For the time being, this function calculates ...
  /// item rarity, numberOfProperties (how many properties an item will have) ...
  /// and decides which props an item will have.
  /// @param _blockNumber block number used for RNG.
  /// @param _player player address. Used for RNG.
  /// @return rolledProps which properties the item will have.
  function calculate(uint256 _blockNumber, address _player) public returns (uint256[] rolledProps) {
    uint256 rarity = _roll(_blockNumber, _player, 0, 100);
    uint256 stats;
    uint256 numberOfProps;

    if (rarity <= LEGENDARY) {
      stats = 150;
      numberOfProps = _roll(_blockNumber, _player, 8, 10);
    }

    else if (rarity <= MYTHICAL) {
      stats = 80;
      numberOfProps = _roll(_blockNumber, _player, 7, 8);
    }

    else if (rarity <= RARE) {
      stats = 50;
      numberOfProps = _roll(_blockNumber, _player, 5, 6);
    }

    else if (rarity <= UNCOMMON) {
      stats = 25;
      numberOfProps = _roll(_blockNumber, _player, 3, 4);
    }

    else {
      stats = 10;
      numberOfProps = _roll(_blockNumber, _player, 1, 2);
    }

    rolledProps = _rollMultiple(_blockNumber, _player, numberOfProps);
    mintItem(stats, rolledProps);
  }
  
  function mintItem(uint256 _stats, uint256[] _rolledProps) private {
    for (uint256 i = 0; i < _rolledProps.length; i++) {
      if (_rolledProps[i] == 1) {
        _rolledProps[i] += _stats;
      }
    }

    Item memory _item = Item({
      prop1: uint8(_rolledProps[0]),
      prop2: uint8(_rolledProps[1]),
      prop3: uint8(_rolledProps[2]),
      prop4: uint8(_rolledProps[3]),
      prop5: uint8(_rolledProps[4]),
      prop6: uint8(_rolledProps[5]),
      prop7: uint8(_rolledProps[6]),
      prop8: uint8(_rolledProps[7]),
      prop9: uint8(_rolledProps[8]),
      prop10: uint8(_rolledProps[9]),
      prop11: uint8(_rolledProps[10]),
      prop12: uint8(_rolledProps[11]),
      prop13: uint8(_rolledProps[12]),
      prop14: uint8(_rolledProps[13])
    });

    uint256 id = items.push(_item) - 1;
  }
}