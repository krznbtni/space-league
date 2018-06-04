pragma solidity ^0.4.24;

contract ItemFactory {
  struct Item {
    uint8 attackSpeed; // in percent
    uint8 criticalChance;  // in percent
    uint8 damageReduction; // in percent
    uint8 energyRegeneration; // in percent
    uint8 healthRegeneration; // in percent
    uint8 stunChance; // in percent
    uint16 defense;
    uint16 durability;
    uint16 lifeSteal;
    uint16 stamina;
    uint16 strength;
  }
}