let assert = require('chai').assert;
let web3;

describe('ItemFactory', function() {
  this.timeout(0);

  let accounts,
      owner,
      personOne,
      personTwo;

  before((done) => {
    let contractsConfig = {
      "SpaceLeagueElement": {},
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
      owner = await ItemFactory.methods.owner().call();
      personOne = accounts[1];
      personTwo = accounts[2];
      done();
    });
  });

  describe('On initialization it...', function() {
    it('Should set the contract creator as owner', async (done) => {
      assert.equal(accounts[0], owner);
      done();
    });

    it('Should set SPACE_LEAGUE_CURRENCY_ADDRESS', async (done) => {
      let SPACE_LEAGUE_CURRENCY_ADDRESS = await ItemFactory.methods.SPACE_LEAGUE_CURRENCY_ADDRESS().call();
      assert.equal(SPACE_LEAGUE_CURRENCY_ADDRESS, SpaceLeagueCurrency.options.address);
      done();
    });
    
    it('Should set SPACE_LEAGUE_ITEM_ADDRESS', async (done) => {
      let SPACE_LEAGUE_ITEM_ADDRESS = await ItemFactory.methods.SPACE_LEAGUE_ITEM_ADDRESS().call();
      assert.equal(SPACE_LEAGUE_ITEM_ADDRESS, SpaceLeagueItem.options.address);
      done();
    });
  });

  describe('Function: SpaceLeagueElement.setGame(address _newGame)', function() {
    describe('When not called by the owner, it...', function() {
      it('Should revert', async (done) => {
        let revert;

        try {
          await SpaceLeagueElement.methods.setGame(owner).send({ from: personOne, gas: '100000' });
        } catch (e) {
          revert = e;
        }
        
        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('When called by the owner, it...', function() {
      it('Should update the game address', async (done) => {
        await SpaceLeagueElement.methods.setGame(owner).send({ from: owner, gas: '100000' });
        
        let gameAddress = await SpaceLeagueElement.methods.gameAddress().call();
        assert.equal(owner, gameAddress);

        done();
      });
    });
  });

  describe('Function: SpaceLeagueItem.setItemFactory(address _itemFactory)', function() {
    describe('When called it...', function() {
      it('Should update the ItemFactory address', async (done) => {
        await SpaceLeagueItem.methods.setItemFactory(ItemFactory.options.address).send({ from: owner, gas: '100000' });
        let itemFactoryAddress = await SpaceLeagueItem.methods.itemFactory().call();

        assert.equal(itemFactoryAddress, ItemFactory.options.address);
        done();
      });
    });
  });

  describe('Function: SpaceLeagueCurrency.mint(address _to, uint256 _amount)', function() {
    describe('When called, it...', function() {
      it('Should mint tokens', async (done) => {
        await SpaceLeagueCurrency.methods.mint(personOne, 1000).send({ from: owner, gas: '100000' });
        let balance = await SpaceLeagueCurrency.methods.balanceOf(personOne).call();
        assert.equal(Number(balance), 1000);
        done();
      });
    });
  });

  describe('Function: ItemFactory.mintItem()', function() {
    describe('When called, it...', function() {
      it('Should mint a new item', async (done) => {
        let revert;

        try {
          await ItemFactory.methods.mintItem().send({ from: personOne, gas: '1000000' });
          let allowance = await SpaceLeagueCurrency.methods.allowance(personOne, ItemFactory.options.address).call();
          console.log('allowance: ', allowance);
        } catch (e) {
          revert = e;
          console.log(e);
        }

        done();
      });
    });
  });



});