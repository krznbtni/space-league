// MAX_UINT(N) = (2^N) -1
// MAX_BYTES(N) as a number = 8^N - 1

pragma solidity ^0.4.24;

import 'libs/math/SafeMath.sol';

contract ClassFactory {
  using SafeMath for uint256;

  struct Class {
    uint8 role; // Medic (0), Esper (1), Warrior (2)
    uint16 attack;
    uint16 defense;
    uint16 energy;
    uint16 health;
  }
  
  // TODO: abilities

  /**
    * Esper (relies on Medical Kit and health regen from gear for healing):
    Reap (Deals damage to 1 foe - 10 energy)
    Telekenetik Storm (Conjures a tornado dealing damage to all foes in its path - 25 energy)
    Concentrated Blade (Manifest a blade that deals damage to 1 mob and stuns it - 35 energy)
  
    * Medic:
    Gamma Rays (Cast 3 damage dealing rays to 1 foe - 15 energy)
    Heal (heals for 50% - 35 energy)
    Nullifier (Casts a force shield, absorbing 100% of the incoming damage for 5 seconds - 45 energy)
  
    * Warrior (relies on Medical Kit and health regen from gear for healing):
    Savage Strike (Deals damage to 3 enemies - 10 energy)
    Dodge (Dodges 1 incoming strike - 25 energy)
    Tremor (Stun all nearby mobs and deal deal damage to all - 50 energy)
    */
}