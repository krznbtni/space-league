let assert = require('chai').assert;
let web3;

describe('ItemFactory', function() {
  this.timeout(0);

  let accounts,
      owner;

  before((done) => {
    let contractsConfig = {
      "SpaceLeagueCurrency": {},
      "SpaceLeagueItem": {},
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
    it('should set SPACE_LEAGUE_ITEM_ADDRESS', async (done) => {
      let SPACE_LEAGUE_ITEM_ADDRESS = await ItemFactory.methods.SPACE_LEAGUE_ITEM_ADDRESS().call();
      console.log(SPACE_LEAGUE_ITEM_ADDRESS);
      done();
    });
  });
});