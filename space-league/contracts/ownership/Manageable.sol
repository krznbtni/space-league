pragma solidity ^0.4.21;

import '../lifecycle/Pausable.sol';

contract Manageable is Pausable {

  address public manager;
  event ManagerTransferred(address indexed previousManager, address indexed newManager);

  constructor() public {
    manager = msg.sender;
  }

  modifier onlyManager() {
    require(msg.sender == manager);
    _;
  }

  modifier onlyAdmin() {
    require((msg.sender == manager) || (msg.sender == owner));
    _;
  }

  function transferManager(address newManager) public onlyAdmin {
    require(newManager != address(0));
    emit ManagerTransferred(manager, newManager);
    manager = newManager;
  }

  function withdrawFunds(address _to, uint256 amount) public onlyOwner {
    require(address(this).balance >= amount);
    if (_to == address(0)) {
      owner.transfer(amount);
    } else {
      _to.transfer(amount);
    }
  }
}
