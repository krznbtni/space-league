let Ownable = artifacts.require("./Ownable");
let Manageable = artifacts.require("./Manageable");
let Pausable = artifacts.require("./Pausable");
let SafeMath = artifacts.require("./SafeMath");
let SpaceLeagueCurrency = artifacts.require("./SpaceLeagueCurrency");
let SpaceLeagueElement = artifacts.require("./SpaceLeagueElement");
let ItemFactory = artifacts.require("./ItemFactory");

module.exports = function (deployer) {
  deployer.deploy(Ownable);
  deployer.deploy(Manageable);
  deployer.deploy(Pausable);
  deployer.deploy(SafeMath);
  deployer.deploy(SpaceLeagueElement);

  deployer.deploy(SpaceLeagueCurrency)
    .then(() => SpaceLeagueCurrency.deployed())
    .then(() => deployer.deploy(ItemFactory, SpaceLeagueCurrency.address));
}