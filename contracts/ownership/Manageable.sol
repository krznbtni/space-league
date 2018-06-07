pragma solidity ^0.4.21;

import '../lifecycle/Pausable.sol';

contract Manageable is Pausable {

  address public manager;
  event ManagerTransferred(address indexed previousManager, address indexed newManager);

  constructor() public {
    manager = msg.sender;
  }

  modifier onlyManager() {
    require(msg.sender == manager, 'REVERT: function caller is not a manager');
    _;
  }

  modifier onlyAdmin() {
    require(
      (msg.sender == manager) || (msg.sender == owner), //solium-disable-line
      'REVERT: function caller is not a manager or owner'
    );
    _;
  }

  function transferManager(address newManager) public onlyAdmin {
    require(newManager != address(0), 'REVERT: address is null');
    emit ManagerTransferred(manager, newManager);
    manager = newManager;
  }

  function withdrawFunds(address _to, uint256 amount) public onlyOwner {
    require(
      address(this).balance >= amount,
      'REVERT: balance is less than the withdrawing amount'
    );
    if (_to == address(0)) {
      owner.transfer(amount);
    } else {
      _to.transfer(amount);
    }
  }
}
