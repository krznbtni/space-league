let assert = require('chai').assert;

// JS explanation: arrow functions don't act like regular functions, so this is bound to the previous function,
// in this case, there is no previous function. Anyway, we want this to be bounded to the Mocha function
describe('SpaceLeagueToken', function() {
  this.timeout(0);

  let accounts, 
      owner;

  before((done) => {
    let contractsConfig = {
      'SpaceLeagueToken': { }
    };

    EmbarkSpec.deployAll(contractsConfig, async (theAccounts) => {
      accounts = theAccounts;
      owner = await SpaceLeagueToken.methods.owner().call();
      done();
    });
  });

  describe('on initialization:', function() {
    it('should set accounts[0] as the contract owner', async (done) => {
      assert.equal(accounts[0], owner);
      done();
    });
  
    it('should have a total supply of 0', async (done) => {
      let totalSupply = await SpaceLeagueToken.methods.totalSupply().call();      
      assert.equal(0, totalSupply);
      done();
    });

    it('accounts[1] should have a balance of 0', async (done) => {
      let balance = await SpaceLeagueToken.methods.balanceOf(accounts[1]).call();
      assert.equal(0, balance);
      done();
    });

    it('the burnPercentage should be 70', async (done) => {
      let burnPercentage = await SpaceLeagueToken.methods.burnPercentage().call();
      assert.equal(70, burnPercentage);
      done();
    });
  });

  describe('Function: setBurnPercentage(uint8 _burnPercentage)', function() {
    it('should revert when not called by the contract owner', async (done) => {
      let revert;

      try {
        await SpaceLeagueToken.methods.setBurnPercentage(15).send({ from: accounts[1], gas: '500000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
      done();
    });

    it('should update the burnPercentage', async (done) => {
      await SpaceLeagueToken.methods.setBurnPercentage(15).send({ from: owner, gas: '500000' });
      let burnPercentage = await SpaceLeagueToken.methods.burnPercentage().call();

      assert.equal(burnPercentage, 15);
      done();
    });
  });

  describe('Function: transfer(address _to, uint256 _value)', function() {
    it('should revert when the contract is paused', async (done) => {
      let revert;
      await SpaceLeagueToken.methods.mint(owner, 1000).send({ from: owner, gas: '500000' });
      await SpaceLeagueToken.methods.pause().send({ from: owner, gas: '500000' });

      try {
        await SpaceLeagueToken.methods.transfer(accounts[1], 500).send({ from: owner, gas: '500000' });
      } catch (e) {
        revert = e;
      }
      
      assert.ok(revert instanceof Error);
      done();
    });
    
    it('should revert when the receiving address is 0', async (done) => {
      let revert;
      await SpaceLeagueToken.methods.mint(owner, 1000).send({ from: owner, gas: '500000' });

      try {
        await SpaceLeagueToken.methods.transfer(0, 500).send({ from: owner, gas: '500000' });
      } catch (e) {
        revert = e;
      }
      
      assert.ok(revert instanceof Error);
      done();
    });

    it('should revert when the sender\'s balance is less than the value', async (done) => {
      let revert;

      try {
        await SpaceLeagueToken.methods.transfer(accounts[1], 500).send({ from: accounts[2], gas: '500000' });
      } catch (e) {
        revert = e;
      }
      
      assert.ok(revert instanceof Error);
      done();
    });
    
    it('should transfer the value from the sender to the receiver', async (done) => {
      await SpaceLeagueToken.methods.mint(owner, 50000).send({ from: owner, gas: '500000' });
      let x = await SpaceLeagueToken.methods.balanceOf(owner).call();

      try {
        await SpaceLeagueToken.methods.transfer(accounts[1], 500).send({ from: owner, gas: '500000' });
      } catch (e) {
        console.log(e);
      }
      done();
    }); 

    // it('should emit an event', async () => {
    //   await SpaceLeagueToken.methods.mint(owner, 9999999).send({ from: owner, gas: '500000' });
    //   await SpaceLeagueToken.methods.unpause().send({ from: owner, gas: '500000' });
    //   let logs = await SpaceLeagueToken.methods.transfer(accounts[1], 1234).send({ from: owner, gas: '500000' });

    //   console.log(logs);
    // });

    // it('should return a boolean of true on completion', async () => {

    // });
  });
});