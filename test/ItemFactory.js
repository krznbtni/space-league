let assert = require('chai').assert;
let web3;

describe('ItemFactory', function() {
  this.timeout(0);

  let accounts,
      owner;

  before((done) => {
    let contractsConfig = {
      "ItemFactory": {
        args: [
          "$SpaceLeagueCurrency",
          "$SpaceLeagueItem"
        ]
      }
    };

    EmbarkSpec.deployAll(contractsConfig, async (theAccounts) => {
      web3 = EmbarkSpec.web3;
      accounts = theAccounts;
      await ItemFactory.methods.owner().call();
      done();
    });
  });

  describe('on initialization:', function() {
    it('should set accounts[0] as the contract owner', async (done) => {
      console.log(owner);
      done();
    });
  });
});