pragma solidity ^0.4.24;

import './ownership/Manageable.sol';

contract SpaceLeagueElement is Manageable {

  address public gameAddress;

  event GameChanged(address newGame);

  modifier onlyGame() {
    require(gameAddress == msg.sender);
    _;
  }

  function setGame(address _newGame) public onlyAdmin {
    require(_newGame != address(0));
    gameAddress = _newGame;
    emit GameChanged(_newGame);
  }
}
