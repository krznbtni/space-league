pragma solidity ^0.4.24;

import '../../../libs/math/SafeMath.sol';
import '../../SpaceLeagueElement.sol';

/// @title Token contract for Space League
/// @author Karzan Botani (https://github.com/botanki)
/// @author Daniel R (https://github.com/DanielRX)
contract SpaceLeagueToken is SpaceLeagueElement {
  using SafeMath for uint256;
  
  uint256 public totalSupply;
  string public name = 'Space League Token';
  string public symbol = 'SPL';
  uint8 public decimals = 18;
  uint8 public tokenRate = 10;
  uint8 public burnPercentage = 70;
  
  mapping (address => mapping (address => uint256)) internal allowed;
  mapping (address => uint256) balances;
  
  event Approval(address indexed owner, address indexed spender, uint256 value);
  event Transfer(address indexed from, address indexed to, uint256 value);
  event Mint(address indexed to, uint256 amount);
  event Burn(address indexed burner, uint256 value);
  
  function totalSupply() public view returns (uint256) {
    return totalSupply;
  }
  
  function balanceOf(address _owner) public view returns (uint256 balance) {
    return balances[_owner];
  }

  function setBurnPercentage(uint8 _burnPercentage) public onlyOwner returns (bool) {
    burnPercentage = _burnPercentage;
  }
  
  function transfer(address _to, uint256 _value) public whenNotPaused returns (bool) {
    return (_transfer(_to, msg.sender, _value));
  }
  
  function transferFrom(address _from, address _to, uint256 _value) public whenNotPaused returns (bool) {
    return(_transferFrom(_from, _to, _value));
  }
  
  function safeTransfer(address to, uint256 value) public {
    assert(transfer(to, value));
  }
  
  function safeTransferFrom(address from, address to, uint256 value) public {
    assert(transferFrom(from, to, value));
  }

  function approve(address _spender, uint256 _value) public whenNotPaused returns (bool) {
    return (_approve(_spender, _value));
  }
  
  function safeApprove(address spender, uint256 value) public {
    assert(approve(spender, value));
  }
  
  function allowance(address _owner, address _spender) public whenNotPaused view returns (uint256) {
    return allowed[_owner][_spender];
  }
  
  function increaseApproval(address _spender, uint256 _addedValue) public whenNotPaused returns (bool) {
    allowed[msg.sender][_spender] = allowed[msg.sender][_spender].add(_addedValue);
    emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }
  
  function decreaseApproval(address _spender, uint256 _subtractedValue) public whenNotPaused returns (bool) {
    uint256 oldValue = allowed[msg.sender][_spender];
    if (_subtractedValue > oldValue) {
      allowed[msg.sender][_spender] = 0;
    } else {
      allowed[msg.sender][_spender] = allowed[msg.sender][_spender].sub(_subtractedValue);
    }
    
    emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }

  function mint(address _to, uint256 _amount) public onlyOwner returns (bool) {
    return(_mint(_to, _amount));
  }
  
  function mintWithEth() public whenNotPaused payable returns (bool) {
    return(_mint(msg.sender, msg.value.mul(tokenRate)));
  }

  function mintWithEthByGame() public payable whenNotPaused onlyGame returns (bool) {
    return(_mint(tx.origin, msg.value.mul(tokenRate))); //solium-disable-line
  }

  function burn(uint256 _amount) public whenNotPaused {
    _burn(msg.sender, _amount);
  }
  
  function burnAll() public whenNotPaused {
    _burn(msg.sender, balances[msg.sender]);
  }

  function burnByGame(uint256 _amount) public onlyOwner {
    _burn(tx.origin, _amount); //solium-disable-line
  }

  function burnAllByGame(address _to) public onlyOwner {
    _burn(_to, balances[_to]);
  }
  
  function _addressNotNull(address _to) private pure returns (bool) {
    return _to != address(0);
  }
  
  function _transfer(address _to, address _from, uint256 _value) private returns (bool) {
    require(_addressNotNull(_to));
    require(_value <= balances[_from]);
    
    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);
    emit Transfer(_from, _to, _value);
    return true;
  }
  
  function _transferFrom(address _from, address _to, uint256 _value) private returns (bool) {
    require(_addressNotNull(_to));
    require(_value <= balances[_from]);
    require(_value <= allowed[_from][msg.sender]);
    
    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);
    
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    emit Transfer(_from, _to, _value);
    return true;
  }
  
  function _approve(address _spender, uint256 _value) private returns (bool) {
    allowed[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value);
    return true;
  }
  
  function _mint(address _to, uint256 _amount) private returns (bool) {
    totalSupply = totalSupply.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    emit Mint(_to, _amount);
    emit Transfer(address(0), _to, _amount);
    return true;
  }
  
  function _burn(address _who, uint256 _value) internal {
    require(_value <= balances[_who]);
    balances[_who] = balances[_who].sub(_value);
    address(tx.origin).transfer((_value * burnPercentage).div(100)); //solium-disable-line
    totalSupply = totalSupply.sub(_value);
    emit Burn(_who, _value);
    emit Transfer(_who, address(0), _value);
  }
}