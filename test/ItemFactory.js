let assert = require('chai').assert;
let web3;

describe('ItemFactory', function() {
  this.timeout(0);

  let accounts,
      owner,
      personOne,
      personTwo,
      personThree,
      EXAMPLE_MINT_PRICE;

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

    EmbarkSpec.deployAll(contractsConfig, async (allAccounts) => {
      web3 = EmbarkSpec.web3;
      accounts = allAccounts;
      owner = await ItemFactory.methods.owner().call();
      personOne = accounts[1];
      personTwo = accounts[2];
      personThree = accounts[3];
      EXAMPLE_MINT_PRICE = await ItemFactory.methods.EXAMPLE_MINT_PRICE().call();
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
    describe('If called when no allowance has been set...', function() {
      it('Should revert', async (done) => {
        let revert;

        try {
          await ItemFactory.methods.mintItem().send({ from: personOne, gas: '1000000' });
        } catch (e) {
          revert = e;
        }

        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('When called, it...', function() {
      it('Should mint a new item', async (done) => {
        await SpaceLeagueCurrency.methods.approve(ItemFactory.options.address, EXAMPLE_MINT_PRICE).send({ from: personOne, gas: '100000' });
        let allowance = await SpaceLeagueCurrency.methods.allowance(personOne, ItemFactory.options.address).call();
        assert.equal(allowance, EXAMPLE_MINT_PRICE);
        
        // will be item 
        await ItemFactory.methods.mintItem().send({ from: personOne, gas: '1000000' });

        allowance = await SpaceLeagueCurrency.methods.allowance(personOne, ItemFactory.options.address).call();
        assert.equal(allowance, 0);

        let itemTotalSupply = await SpaceLeagueItem.methods.totalSupply().call();
        assert.equal(itemTotalSupply, 1);

        let ownerOf = await SpaceLeagueItem.methods.ownerOf(0).call();
        assert.equal(ownerOf, personOne);

        done();
      });
    });
  });

  describe('Function: burnItem(uint256 _itemId)', function() {
    describe('If called by any other than the item owner, it..', function() {
      it('Should revert', async (done) => {
        let revert;

        try {
          await ItemFactory.methods.burnItem(0).send({ from: personTwo, gas: '1000000' });
        } catch (e) {
          revert = e;
        }
        
        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('If called by the item owner, it...', function() {
      it('Should burn the item', async (done) => {
        let ownerOf = await SpaceLeagueItem.methods.ownerOf(0).call();
        assert.equal(ownerOf, personOne);

        let exists = await SpaceLeagueItem.methods.exists(0).call();
        assert.equal(true, exists);

        await ItemFactory.methods.burnItem(0).send({ from: personOne, gas: '1000000' });

        exists = await SpaceLeagueItem.methods.exists(0).call();
        assert.equal(false, exists);

        done();
      }); 
    });
  });

  describe('Function: donateItem(address _to, uint256 _tokenId)', function() {
    describe('If called by the item owner it...', function() {
      it('Should send the item from owner to receiver', async (done) => {
        await SpaceLeagueCurrency.methods.approve(ItemFactory.options.address, EXAMPLE_MINT_PRICE).send({ from: personOne, gas: '100000' });
        await ItemFactory.methods.mintItem().send({ from: personOne, gas: '1000000' });

        let exists = await SpaceLeagueItem.methods.exists(1).call();
        assert.equal(exists, true);

        let ownerOf = await SpaceLeagueItem.methods.ownerOf(1).call();
        assert.equal(ownerOf, personOne);

        try {
          await SpaceLeagueItem.methods.approve(ItemFactory.options.address, 1).send({ from: personOne, gas: '1000000' });
          await ItemFactory.methods.donateItem(personTwo, 1).send({ from: personOne, gas: '1000000' });
        } catch (e) {
          console.log(e);
        }

        done();
      });
    });
  });


});