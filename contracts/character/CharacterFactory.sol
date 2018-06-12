pragma solidity ^0.4.24;

import '../class/ClassFactory.sol';

contract CharacterFactory is ClassFactory {
  using SafeMath for uint256;

  struct Character {
    Class class;
    uint8 level;
    uint16 experience;
    uint16 lossCount; // duel loss count
    uint16 winCount; // duel win count
  }

  Character[] public characters;

  mapping (uint256 => address) public characterToOwner;
  
  event OnMintCharacter(uint256 _characterId, address _owner);

  function mintCharacter(uint8 _role) public {
    Character memory character = Character({
      class: Class(_role, 5, 6, 7, 8),
      level: 1,
      experience: 0,
      lossCount: 0,
      winCount: 0
    });

    uint id = characters.push(character).sub(1);
    characterToOwner[id] = msg.sender;
    emit OnMintCharacter(id, msg.sender);
  }

  function getCharacter(uint256 _id) public view returns (uint8, uint16, uint16, uint16, uint16, uint8, uint16, uint16, uint16) {
    Character memory character = characters[_id];
    return (
      character.class.role,
      character.class.attack,
      character.class.defense,
      character.class.energy,
      character.class.health,
      character.level,
      character.experience,
      character.lossCount,
      character.winCount
    );
  }
}