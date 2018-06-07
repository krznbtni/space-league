let assert = require('chai').assert;

// JS explanation: arrow functions don't act like regular functions, so this is bound to the previous function,
// in this case, there is no previous function. Anyway, we want this to be bounded to the Mocha function
describe('SpaceLeagueToken', function() {
  this.timeout(0);

  let accounts, 
      owner,
      personOne,
      personTwo;

  before((done) => {
    let contractsConfig = {
      'SpaceLeagueToken': { }
    };

    EmbarkSpec.deployAll(contractsConfig, async (theAccounts) => {
      accounts = theAccounts;
      personOne = accounts[1];
      personTwo = accounts[2];
      owner = await SpaceLeagueToken.methods.owner().call();
      done();
    });
  });

  /*
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

    it('personOne should have a balance of 0', async (done) => {
      let balance = await SpaceLeagueToken.methods.balanceOf(personOne).call();
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
    describe('When not called by the contract owner', function() {
      it('should revert', async (done) => {
        let revert;
  
        try {
          await SpaceLeagueToken.methods.setBurnPercentage(15).send({ from: personOne, gas: '100000' });
        } catch (e) {
          revert = e;
        }
  
        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('When called by the contract owner', function() {
      it('should update the burnPercentage', async (done) => {
        await SpaceLeagueToken.methods.setBurnPercentage(15).send({ from: owner, gas: '100000' });
        let burnPercentage = await SpaceLeagueToken.methods.burnPercentage().call();
  
        assert.equal(burnPercentage, 15);
        done();
      });
    });
  });

  describe('Function: transfer(address _to, uint256 _value)', function() {
    describe('When the contract is paused', function() {
      it('should revert', async (done) => {
        let revert;
        await SpaceLeagueToken.methods.mint(owner, 1000).send({ from: owner, gas: '100000' });
        await SpaceLeagueToken.methods.pause().send({ from: owner, gas: '100000' });
  
        try {
          await SpaceLeagueToken.methods.transfer(personOne, 500).send({ from: owner, gas: '100000' });
        } catch (e) {
          revert = e;
        }
        
        assert.ok(revert instanceof Error);
        done();
      });
    });
    
    describe('When the receiving address is null', function() {
      it('should revert', async (done) => {
        let revert;
        await SpaceLeagueToken.methods.mint(owner, 1000).send({ from: owner, gas: '100000' });
  
        try {
          await SpaceLeagueToken.methods.transfer(0, 500).send({ from: owner, gas: '100000' });
        } catch (e) {
          revert = e;
        }
        
        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('When the sender\'s balance is less than the value', function() {
      it('should revert', async (done) => {
        let revert;
  
        try {
          await SpaceLeagueToken.methods.transfer(personOne, 500).send({ from: personTwo, gas: '100000' });
        } catch (e) {
          revert = e;
        }
        
        assert.ok(revert instanceof Error);
        done();
      });
    });
    
    describe('When the sender has enough balance and the receiving address is not null', function() {
      it('should transfer the value to the receiver', async (done) => {
        await SpaceLeagueToken.methods.mint(owner, 1000).send({ from: owner, gas: '100000' });
  
        try {
          await SpaceLeagueToken.methods.transfer(personOne, 500).send({ from: owner, gas: '100000' });
        } catch (e) {
          console.log(e);
        }
        done();
      });

      it('should emit an event', async () => {
        await SpaceLeagueToken.methods.mint(owner, 1000).send({ from: owner, gas: '100000' });
        let logs = await SpaceLeagueToken.methods.transfer(personOne, 500).send({ from: owner, gas: '100000' });
        let from = logs.events.Transfer.returnValues.from,
            to = logs.events.Transfer.returnValues.to,
            value = logs.events.Transfer.returnValues.value;
  
        assert.equal(from, owner);
        assert.equal(to, personOne);
        assert.equal(value, 500);
      });
    });
  });

  describe('Function: transferFrom(address _from, address _to, uint256 _value)', function() {
    describe('when the contract is paused', function() {
      it('should revert', async (done) => {
        let revert;
        await SpaceLeagueToken.methods.mint(owner, 1000).send({ from: owner, gas: '100000' });
        await SpaceLeagueToken.methods.approve(personOne, 500).send({ from: owner, gas: '100000' });
        await SpaceLeagueToken.methods.pause().send({ from: owner, gas: '100000' });
  
        try {
          await SpaceLeagueToken.methods.transferFrom(owner, personTwo, 500).send({ from: personOne, gas: '100000' });
        } catch (e) {
          revert = e;
        }
        
        assert.ok(revert instanceof Error);
        done();
      });
    });
    
    describe('when the receiving address is null', function() {
      it('should revert', async (done) => {
        let revert;
        await SpaceLeagueToken.methods.mint(owner, 1000).send({ from: owner, gas: '100000' });
  
        try {
          await SpaceLeagueToken.methods.approve(personOne, 500).send({ from: owner, gas: '100000' });
          await SpaceLeagueToken.methods.transferFrom(owner, 0, 500).send({ from: personOne, gas: '100000' });
        } catch (e) {
          revert = e;
        }
        
        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('when the sender\'s allowance is too low', function() {
      it('should revert when the sender\'s balance is too low', async (done) => {
        let revert;
        await SpaceLeagueToken.methods.mint(owner, 1000).send({ from: owner, gas: '100000' });
  
        try {
          await SpaceLeagueToken.methods.approve(personOne, 500).send({ from: owner, gas: '100000' });
          await SpaceLeagueToken.methods.transferFrom(owner, personTwo, 5000).send({ from: personOne, gas: '100000' });
        } catch (e) {
          revert = e;
        }
        
        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('when the sender does not have an allowance', function() {
      it('should revert', async (done) => {
        let revert;
        await SpaceLeagueToken.methods.mint(owner, 1000).send({ from: owner, gas: '100000' });
  
        try {
          await SpaceLeagueToken.methods.transferFrom(owner, personTwo, 500).send({ from: personOne, gas: '100000' });
        } catch (e) {
          revert = e;
        }
        
        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('when the sender has been allowed', function() {
      it('should send the allowed value to the receiver', async (done) => {
        await SpaceLeagueToken.methods.mint(owner, 1000).send({ from: owner, gas: '100000' });
        await SpaceLeagueToken.methods.approve(personOne, 500).send({ from: owner, gas: '100000' });
        await SpaceLeagueToken.methods.transferFrom(owner, personTwo, 500).send({ from: personOne, gas: '100000' });
  
        let ownerBalance = await SpaceLeagueToken.methods.balanceOf(owner).call();
        let receiverBalance = await SpaceLeagueToken.methods.balanceOf(personTwo).call();
  
        assert.equal(ownerBalance, 2500);
        assert.equal(receiverBalance, 500);
        done();
      });
    });
  });

  describe('Function: approve(address _spender, uint256 _value)', function() {
    describe('If called when contract is paused', function() {
      it('should revert', async (done) => {
        await SpaceLeagueToken.methods.mint(owner, 1000).send({ from: owner, gas: '100000' });
        await SpaceLeagueToken.methods.pause().send({ from: owner, gas: '100000' });

        let revert;
        try {
          await SpaceLeagueToken.methods.approve(personOne, 500).send({ from: owner, gas: '100000' });
        } catch (e) {
          revert = e;
        }

        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('If called when the contract is un paused', function() {
      it('should set allowance for the spender', async (done) => {
        await SpaceLeagueToken.methods.unpause().send({ from: owner, gas: '100000' });
        await SpaceLeagueToken.methods.mint(owner, 1000).send({ from: owner, gas: '100000' });
        await SpaceLeagueToken.methods.approve(personOne, 500).send({ from: owner, gas: '100000' });
        let allowance = await SpaceLeagueToken.methods.allowance(owner, personOne).call();
        assert.equal(allowance, 500);
        done();
      });
    });
  });

  describe('Function: increaseApproval(address _spender, uint256 _addedValue)', function() {
    describe('If the contract is paused...', function() {
      it('Should revert', async (done) => {
        await SpaceLeagueToken.methods.pause().send({ from: owner, gas: '100000' });

        let revert;
        try {
          await SpaceLeagueToken.methods.increaseApproval(personOne, 500).send({ from: owner, gas: '100000' });
        } catch (e) {
          revert = e;
        }

        assert.ok(revert instanceof Error);
        done();
      });
    });
    
    describe('If the contract is not paused...', function() {
      it('Should increase the allowance', async (done) => {
        await SpaceLeagueToken.methods.unpause().send({ from: owner, gas: '100000' });
        let allowance = await SpaceLeagueToken.methods.allowance(owner, personOne).call();
        assert.equal(allowance, 500);
        await SpaceLeagueToken.methods.increaseApproval(personOne, 500).send({ from: owner, gas: '100000' });
        allowance = await SpaceLeagueToken.methods.allowance(owner, personOne).call();
        assert.equal(allowance, 1000);
        done();
      });
    });
  });

  describe('Function: decreaseApproval(address _spender, uint256 _subtractedValue)', function() {
    describe('If the contract is paused...', function() {
      it('Should revert', async (done) => {
        await SpaceLeagueToken.methods.pause().send({ from: owner, gas: '100000' });

        let revert;
        try {
          await SpaceLeagueToken.methods.decreaseApproval(personOne, 500).send({ from: owner, gas: '100000' });
        } catch (e) {
          revert = e;
        }

        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('If the contract is not paused and the subtracted value is higher than the current allowance...', function() {
      it('Should set the allowance to 0', async (done) => {
        await SpaceLeagueToken.methods.unpause().send({ from: owner, gas: '100000' });
        let allowance = await SpaceLeagueToken.methods.allowance(owner, personOne).call();

        await SpaceLeagueToken.methods.decreaseApproval(personOne, (allowance + 10000000)).send({ from: owner, gas: '100000' });
        allowance = await SpaceLeagueToken.methods.allowance(owner, personOne).call();
        
        assert.equal(allowance, 0);
        done();
      });
    });

    describe('If the contract is not paused...', function() {
      it('Should decrease the allowance', async (done) => {
        await SpaceLeagueToken.methods.increaseApproval(personOne, 1000).send({ from: owner, gas: '100000' });
        let allowance = await SpaceLeagueToken.methods.allowance(owner, personOne).call();

        await SpaceLeagueToken.methods.decreaseApproval(personOne, (allowance / 2)).send({ from: owner, gas: '100000' });
        allowance = await SpaceLeagueToken.methods.allowance(owner, personOne).call();
        
        assert.equal(allowance, 500);
        done();
      });

      it('Should emit the Approval event', async (done) => {
        let allowance = await SpaceLeagueToken.methods.allowance(owner, personOne).call();
        let logs = await SpaceLeagueToken.methods.decreaseApproval(personOne, (allowance / 2)).send({ from: owner, gas: '100000' });
        logs = logs.events.Approval.returnValues;
        const caller = logs.owner,
              spender = logs.spender,
              value = logs.value;
        
        assert.ok(caller, owner);
        assert.ok(spender, personOne);
        assert.ok(value, (allowance / 2));
        done();
      });
    });

  });
  */
 
});