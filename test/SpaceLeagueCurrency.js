let assert = require('chai').assert;
let web3;

// JS explanation: arrow functions don't act like regular functions, so this is bound to the previous function,
// in this case, there is no previous function. Anyway, we want this to be bounded to the Mocha function
describe('SpaceLeagueCurrency', function() {
  this.timeout(0);

  let accounts, 
      owner,
      personOne,
      personTwo;

  before((done) => {
    let contractsConfig = {
      'SpaceLeagueCurrency': { }
    };

    EmbarkSpec.deployAll(contractsConfig, async (theAccounts) => {
      web3 = EmbarkSpec.web3;
      accounts = theAccounts;
      personOne = accounts[1];
      personTwo = accounts[2];
      owner = await SpaceLeagueCurrency.methods.owner().call();
      done();
    });
  });

  describe('on initialization:', function() {
    it('should set accounts[0] as the contract owner', async (done) => {
      assert.equal(accounts[0], owner);
      done();
    });
  
    it('should have a total supply of 0', async (done) => {
      let totalSupply = await SpaceLeagueCurrency.methods.totalSupply().call();      
      assert.equal(0, totalSupply);
      done();
    });

    it('personOne should have a balance of 0', async (done) => {
      let balance = await SpaceLeagueCurrency.methods.balanceOf(personOne).call();
      assert.equal(0, balance);
      done();
    });

    it('the burnPercentage should be 70', async (done) => {
      let burnPercentage = await SpaceLeagueCurrency.methods.burnPercentage().call();
      assert.equal(70, burnPercentage);
      done();
    });
  });

  describe('Function: setBurnPercentage(uint8 _burnPercentage)', function() {
    describe('When not called by the contract owner', function() {
      it('should revert', async (done) => {
        let revert;
  
        try {
          await SpaceLeagueCurrency.methods.setBurnPercentage(15).send({ from: personOne, gas: '100000' });
        } catch (e) {
          revert = e;
        }
  
        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('When called by the contract owner', function() {
      it('should update the burnPercentage', async (done) => {
        await SpaceLeagueCurrency.methods.setBurnPercentage(15).send({ from: owner, gas: '100000' });
        let burnPercentage = await SpaceLeagueCurrency.methods.burnPercentage().call();
  
        assert.equal(burnPercentage, 15);
        done();
      });
    });
  });

  describe('Function: transfer(address _to, uint256 _value)', function() {
    describe('When the contract is paused', function() {
      it('should revert', async (done) => {
        let revert;
        await SpaceLeagueCurrency.methods.mint(owner, 1000).send({ from: owner, gas: '100000' });
        await SpaceLeagueCurrency.methods.pause().send({ from: owner, gas: '100000' });
  
        try {
          await SpaceLeagueCurrency.methods.transfer(personOne, 500).send({ from: owner, gas: '100000' });
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
        await SpaceLeagueCurrency.methods.mint(owner, 1000).send({ from: owner, gas: '100000' });
  
        try {
          await SpaceLeagueCurrency.methods.transfer(0, 500).send({ from: owner, gas: '100000' });
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
          await SpaceLeagueCurrency.methods.transfer(personOne, 500).send({ from: personTwo, gas: '100000' });
        } catch (e) {
          revert = e;
        }
        
        assert.ok(revert instanceof Error);
        done();
      });
    });
    
    describe('When the sender has enough balance and the receiving address is not null', function() {
      it('should transfer the value to the receiver', async (done) => {
        await SpaceLeagueCurrency.methods.unpause().send({ from: owner, gas: '100000' });

        let personOneBalance = await SpaceLeagueCurrency.methods.balanceOf(personOne).call();
        assert.equal(personOneBalance, 0);

        await SpaceLeagueCurrency.methods.mint(personTwo, 1000).send({ from: owner, gas: '100000' });

        let personTwoBalance = await SpaceLeagueCurrency.methods.balanceOf(personTwo).call();
        assert.equal(personTwoBalance, 1000);

        await SpaceLeagueCurrency.methods.transfer(personOne, 1000).send({ from: personTwo, gas: '100000' });

        personOneBalance = await SpaceLeagueCurrency.methods.balanceOf(personOne).call();
        assert.equal(personOneBalance, 1000);

        personTwoBalance = await SpaceLeagueCurrency.methods.balanceOf(personTwo).call();
        assert.equal(personTwoBalance, 0);

        done();
      });

      it('should emit an event', async () => {
        await SpaceLeagueCurrency.methods.mint(owner, 1000).send({ from: owner, gas: '100000' });
        let logs = await SpaceLeagueCurrency.methods.transfer(personOne, 500).send({ from: owner, gas: '100000' });
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
        await SpaceLeagueCurrency.methods.mint(owner, 1000).send({ from: owner, gas: '100000' });
        await SpaceLeagueCurrency.methods.approve(personOne, 500).send({ from: owner, gas: '100000' });
        await SpaceLeagueCurrency.methods.pause().send({ from: owner, gas: '100000' });
  
        try {
          await SpaceLeagueCurrency.methods.transferFrom(owner, personTwo, 500).send({ from: personOne, gas: '100000' });
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
        await SpaceLeagueCurrency.methods.mint(owner, 1000).send({ from: owner, gas: '100000' });
  
        try {
          await SpaceLeagueCurrency.methods.approve(personOne, 500).send({ from: owner, gas: '100000' });
          await SpaceLeagueCurrency.methods.transferFrom(owner, 0, 500).send({ from: personOne, gas: '100000' });
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
        await SpaceLeagueCurrency.methods.mint(owner, 1000).send({ from: owner, gas: '100000' });
  
        try {
          await SpaceLeagueCurrency.methods.approve(personOne, 500).send({ from: owner, gas: '100000' });
          await SpaceLeagueCurrency.methods.transferFrom(owner, personTwo, 5000).send({ from: personOne, gas: '100000' });
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
        await SpaceLeagueCurrency.methods.mint(owner, 1000).send({ from: owner, gas: '100000' });
  
        try {
          await SpaceLeagueCurrency.methods.transferFrom(owner, personTwo, 500).send({ from: personOne, gas: '100000' });
        } catch (e) {
          revert = e;
        }
        
        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('when the sender has been allowed', function() {
      it('should send the allowed value to the receiver', async (done) => {
        await SpaceLeagueCurrency.methods.unpause().send({ from: owner, gas: '100000' });

        // returns 6500
        let ownerBalance = await SpaceLeagueCurrency.methods.balanceOf(owner).call();
        assert.equal(Number(ownerBalance), 6500);

        await SpaceLeagueCurrency.methods.approve(personOne, 6500).send({ from: owner, gas: '100000' });
        await SpaceLeagueCurrency.methods.transferFrom(owner, personTwo, 6500).send({ from: personOne, gas: '100000' });
  
        ownerBalance = await SpaceLeagueCurrency.methods.balanceOf(owner).call();
        let personTwoBalance = await SpaceLeagueCurrency.methods.balanceOf(personTwo).call();

        assert.equal(Number(ownerBalance), 0);
        assert.equal(Number(personTwoBalance), 6500);
        done();
      });
    });
  });

  describe('Function: approve(address _spender, uint256 _value)', function() {
    describe('If called when contract is paused', function() {
      it('should revert', async (done) => {
        await SpaceLeagueCurrency.methods.mint(owner, 1000).send({ from: owner, gas: '100000' });
        await SpaceLeagueCurrency.methods.pause().send({ from: owner, gas: '100000' });

        let revert;
        try {
          await SpaceLeagueCurrency.methods.approve(personOne, 500).send({ from: owner, gas: '100000' });
        } catch (e) {
          revert = e;
        }

        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('If called when the contract is un paused', function() {
      it('should set allowance for the spender', async (done) => {
        await SpaceLeagueCurrency.methods.unpause().send({ from: owner, gas: '100000' });
        await SpaceLeagueCurrency.methods.mint(owner, 1000).send({ from: owner, gas: '100000' });
        await SpaceLeagueCurrency.methods.approve(personOne, 500).send({ from: owner, gas: '100000' });
        let allowance = await SpaceLeagueCurrency.methods.allowance(owner, personOne).call();
        assert.equal(allowance, 500);
        done();
      });
    });
  });

  describe('Function: increaseApproval(address _spender, uint256 _addedValue)', function() {
    describe('If the contract is paused...', function() {
      it('Should revert', async (done) => {
        await SpaceLeagueCurrency.methods.pause().send({ from: owner, gas: '100000' });

        let revert;
        try {
          await SpaceLeagueCurrency.methods.increaseApproval(personOne, 500).send({ from: owner, gas: '100000' });
        } catch (e) {
          revert = e;
        }

        assert.ok(revert instanceof Error);
        done();
      });
    });
    
    describe('If the contract is not paused...', function() {
      it('Should increase the allowance', async (done) => {
        await SpaceLeagueCurrency.methods.unpause().send({ from: owner, gas: '100000' });
        let allowance = await SpaceLeagueCurrency.methods.allowance(owner, personOne).call();
        assert.equal(allowance, 500);
        await SpaceLeagueCurrency.methods.increaseApproval(personOne, 500).send({ from: owner, gas: '100000' });
        allowance = await SpaceLeagueCurrency.methods.allowance(owner, personOne).call();
        assert.equal(allowance, 1000);
        done();
      });
    });
  });

  describe('Function: decreaseApproval(address _spender, uint256 _subtractedValue)', function() {
    describe('If the contract is paused...', function() {
      it('Should revert', async (done) => {
        await SpaceLeagueCurrency.methods.pause().send({ from: owner, gas: '100000' });

        let revert;
        try {
          await SpaceLeagueCurrency.methods.decreaseApproval(personOne, 500).send({ from: owner, gas: '100000' });
        } catch (e) {
          revert = e;
        }

        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('If the contract is not paused and the subtracted value is higher than the current allowance...', function() {
      it('Should set the allowance to 0', async (done) => {
        await SpaceLeagueCurrency.methods.unpause().send({ from: owner, gas: '100000' });
        let allowance = await SpaceLeagueCurrency.methods.allowance(owner, personOne).call();

        await SpaceLeagueCurrency.methods.decreaseApproval(personOne, (allowance + 10000000)).send({ from: owner, gas: '100000' });
        allowance = await SpaceLeagueCurrency.methods.allowance(owner, personOne).call();
        
        assert.equal(allowance, 0);
        done();
      });
    });

    describe('If the contract is not paused...', function() {
      it('Should decrease the allowance', async (done) => {
        await SpaceLeagueCurrency.methods.increaseApproval(personOne, 1000).send({ from: owner, gas: '100000' });
        let allowance = await SpaceLeagueCurrency.methods.allowance(owner, personOne).call();

        await SpaceLeagueCurrency.methods.decreaseApproval(personOne, (allowance / 2)).send({ from: owner, gas: '100000' });
        allowance = await SpaceLeagueCurrency.methods.allowance(owner, personOne).call();
        
        assert.equal(allowance, 500);
        done();
      });

      it('Should emit the Approval event', async (done) => {
        let allowance = await SpaceLeagueCurrency.methods.allowance(owner, personOne).call();
        let logs = await SpaceLeagueCurrency.methods.decreaseApproval(personOne, (allowance / 2)).send({ from: owner, gas: '100000' });
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

  describe('Function: mint(address _to, uint256 _amount)', function() {
    describe('When not called by the contract owner...', function() {
      it('Should revert', async (done) => {
        let revert;

        try {
          await SpaceLeagueCurrency.methods.mint(personTwo, 1000).send({ from: personOne, gas: '100000' });
        } catch (e) {
          revert = e;
        }

        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('If called by the owner...', function() {
      it('Should mint new tokens, add them to the total supply, and send the minted tokens to the assigned address', async (done) => {
        // Returns 10 000 because of earlier minted tokens
        let totalSupply = await SpaceLeagueCurrency.methods.totalSupply().call();
        assert.equal(Number(totalSupply), 10000);

        // returns 2 000
        let ownerBalance = await SpaceLeagueCurrency.methods.balanceOf(owner).call();
        assert.equal(Number(ownerBalance), 2000)

        await SpaceLeagueCurrency.methods.mint(owner, 500).send({ from: owner, gas: '100000' });

        totalSupply = await SpaceLeagueCurrency.methods.totalSupply().call();
        assert.equal(Number(totalSupply), 10500);

        ownerBalance = await SpaceLeagueCurrency.methods.balanceOf(owner).call();
        assert.equal(Number(ownerBalance), 2500);

        done();
      });

      it('Should emit event: Mint', async (done) => {
        let logs = await SpaceLeagueCurrency.methods.mint(personOne, 500).send({ from: owner, gas: '100000' });
        const to = logs.events.Mint.returnValues.to;
        const amount = logs.events.Mint.returnValues.amount;
        assert.equal(to, personOne);
        assert.equal(amount, 500);
        done();
      });

      it('Should emit event: Transfer', async (done) => {
        let logs = await SpaceLeagueCurrency.methods.mint(personOne, 500).send({ from: owner, gas: '100000' });
        const caller = logs.events.Transfer.returnValues.from;
        const to = logs.events.Transfer.returnValues.to;
        const value = logs.events.Transfer.returnValues.value;

        assert.equal(caller, '0x0000000000000000000000000000000000000000');
        assert.equal(to, personOne);
        assert.equal(value, 500);
        done();
      });
    });
  });

  describe('Function: mintWithEth() payable', function() {
    describe('If called when the contract is paused...', function() {
      it('Should revert', async (done) => {
        await SpaceLeagueCurrency.methods.pause().send({ from: owner, gas: '100000' });
        let revert;

        try {
          await SpaceLeagueCurrency.methods.mintWithEth().send({ from: personOne, value: '50000', gas: '100000' });
        } catch (e) {
          revert = e;
        }
        
        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('If called when the contract is not paused...', function() {
      it('Should be payable', async (done) => {
        await SpaceLeagueCurrency.methods.unpause().send({ from: owner, gas: '100000' });
        await SpaceLeagueCurrency.methods.mintWithEth().send({ from: personOne, value: '50000', gas: '100000' });
        done();
      });

      it('Should mint the correct amount of tokens (msg.value * tokenRate)', async (done) => {
        const tokenRate = 10;

        // Returns 511 500
        let currentSupply = await SpaceLeagueCurrency.methods.totalSupply().call();

        // Returns 6500 from earlier
        let personTwoBalance = await SpaceLeagueCurrency.methods.balanceOf(personTwo).call();
        assert.equal(Number(personTwoBalance), 6500);

        await SpaceLeagueCurrency.methods.mintWithEth().send({ from: personTwo, value: '100', gas: '100000' });
        
        personTwoBalance = await SpaceLeagueCurrency.methods.balanceOf(personTwo).call();
        assert.equal(Number(personTwoBalance), ((tokenRate * 100) + 6500));

        let finalSupply = await SpaceLeagueCurrency.methods.totalSupply().call();

        assert.equal(Number(finalSupply), (Number(currentSupply) + (tokenRate * 100)));
        done();
      });
    });
  });

  describe('Function: mintWithEthByGame()', function() {
    describe('If called when the contract is paused...', function() {
      it('Should revert', async (done) => {
        await SpaceLeagueCurrency.methods.setGame(accounts[9]).send({ from: owner, gas: '100000' });
        let gameAddress = await SpaceLeagueCurrency.methods.gameAddress().call();

        await SpaceLeagueCurrency.methods.pause().send({ from: owner, gas: '100000' });
        let revert;

        try {
          await SpaceLeagueCurrency.methods.mintWithEthByGame().send({ from: gameAddress, value: '50000', gas: '100000' });
        } catch (e) {
          revert = e;
        }
        
        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('If called by any other than the gameAddress', function() {
      it('Should revert', async (done) => {
        await SpaceLeagueCurrency.methods.unpause().send({ from: owner, gas: '100000' });
        await SpaceLeagueCurrency.methods.setGame(accounts[9]).send({ from: owner, gas: '100000' });

        let gameAddress = await SpaceLeagueCurrency.methods.gameAddress().call();
        let revert;

        try {
          await SpaceLeagueCurrency.methods.mintWithEthByGame().send({ from: personOne, value: '50000', gas: '100000' });
        } catch (e) {
          revert = e;
        }
        
        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('If called by the game address when the contract is not paused...', function() {
      it('Should be payable', async (done) => {
        let tokenRate = 10;

        // Returns 512 500 from earlier. 
        let totalSupply = await SpaceLeagueCurrency.methods.totalSupply().call();
        assert.equal(Number(totalSupply), 512500);

        let gameAddress = await SpaceLeagueCurrency.methods.gameAddress().call();

        let gameAddressBalance = await SpaceLeagueCurrency.methods.balanceOf(gameAddress).call();
        assert.equal(Number(gameAddressBalance), 0);

        await SpaceLeagueCurrency.methods.mintWithEthByGame().send({ from: gameAddress, value: '50000', gas: '100000' });
        
        totalSupply = await SpaceLeagueCurrency.methods.totalSupply().call();
        assert.equal(Number(totalSupply), (512500 + (50000 * 10)));

        gameAddressBalance = await SpaceLeagueCurrency.methods.balanceOf(gameAddress).call();
        assert.equal(Number(gameAddressBalance), (50000 * 10));

        done();
      });
    });
  });

  describe('Function: burn(uint256 _amount)', function() {
    describe('If called when the contract is paused...', function() {
      it('Should revert', async (done) => {
        await SpaceLeagueCurrency.methods.pause().send({ from: owner, gas: '100000' });
        let personTwoBalance = await SpaceLeagueCurrency.methods.balanceOf(personTwo).call();

        let revert;

        try {
          await SpaceLeagueCurrency.methods.burn(personTwoBalance).send({ from: personTwo, gas: '100000' });
        } catch (e) {
          revert = e;
        }
        
        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('If the function caller tries to burn a larger amount than his/her balance...', function() {
      it('Should revert', async (done) => {
        await SpaceLeagueCurrency.methods.unpause().send({ from: owner, gas: '100000' });
        
        // returns 7500
        let personTwoBalance = await SpaceLeagueCurrency.methods.balanceOf(personTwo).call();

        let revert;

        try {
          await SpaceLeagueCurrency.methods.burn(8000).send({ from: personTwo, gas: '100000' });
        } catch (e) {
          revert = e;
        }
        
        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('If called when the contract is not paused...', function() {
      it('Should burn the tokens (subtract from totalSupply)', async (done) => {
        // returns 1 012 500
        let totalSupply = await SpaceLeagueCurrency.methods.totalSupply().call();
        assert.equal(Number(totalSupply), 1012500);

        await SpaceLeagueCurrency.methods.burn(500).send({ from: personTwo, gas: '100000' });

        totalSupply = await SpaceLeagueCurrency.methods.totalSupply().call();
        assert.equal(Number(totalSupply), (1012500 - 500));

        done();
      });

      it('Should subtract from the caller\'s balance', async (done) => {
        // returns 7500
        let personTwoBalance = await SpaceLeagueCurrency.methods.balanceOf(personTwo).call();
        assert.equal(Number(personTwoBalance), 7000);

        await SpaceLeagueCurrency.methods.burn(500).send({ from: personTwo, gas: '100000' });

        personTwoBalance = await SpaceLeagueCurrency.methods.balanceOf(personTwo).call();
        assert.equal(Number(personTwoBalance), 6500);
        
        done();
      });

      
      it('Should send ETH (amount burned * burnPercentage) to the burner', async (done) => {
        let initialEthBalance = await web3.eth.getBalance(accounts[1]);
        console.log('initialEthBalance: ', initialEthBalance);

        // await SpaceLeagueCurrency.methods.burn(500).send({ from: personTwo, gas: '100000' });

        // let finalEthBalance = await web3.eth.getBalance(personTwo);

        // assert.notEqual(initialEthBalance, finalEthBalance);

        done();
      });

      it('Should emit event: Burn', async (done) => {
        let logs = await SpaceLeagueCurrency.methods.burn(500).send({ from: personTwo, gas: '100000' });
        
        let burner = logs.events.Burn.returnValues.burner,
            value = logs.events.Burn.returnValues.value;
        
        assert.equal(burner, personTwo);
        assert.equal(Number(value), 500);

        done();
      });

      it('Should emit event: Transfer', async (done) => {
        let logs = await SpaceLeagueCurrency.methods.burn(500).send({ from: personTwo, gas: '100000' });
        
        let from = logs.events.Transfer.returnValues.from,
            to = logs.events.Transfer.returnValues.to,
            value = logs.events.Transfer.returnValues.value;
        
        assert.equal(from, personTwo);
        assert.equal(to, '0x0000000000000000000000000000000000000000');
        assert.equal(Number(value), 500);
        done();
      });
    });
  });

  describe('Function: burnByGame(uint256 _amount)', function() {
    describe('If called by any other than the GAME', function () {
      it('Should revert', async (done) => {
        let revert;

        try {
          await SpaceLeagueCurrency.methods.burnByGame(100).send({ from: personTwo, gas: '100000' });
        } catch (e) {
          revert = e;
        }
        
        assert.ok(revert instanceof Error);

        done();
      });
    });

    describe('If the function caller tries to burn a larger amount than his/her balance...', function() {
      it('Should revert', async (done) => {
        // returns 7500
        let gameAddress = await SpaceLeagueCurrency.methods.gameAddress().call();
        let gameAddressBalance = await SpaceLeagueCurrency.methods.balanceOf(gameAddress).call();

        let revert;

        try {
          await SpaceLeagueCurrency.methods.burnByGame(Number(gameAddressBalance) * 2).send({ from: gameAddress, gas: '100000' });
        } catch (e) {
          revert = e;
        }
        
        assert.ok(revert instanceof Error);
        done();
      });
    });

    describe('If called when the contract is not paused...', function() {
      it('Should burn the tokens (subtract from totalSupply)', async (done) => {
        // returns 1 010 500
        let totalSupply = await SpaceLeagueCurrency.methods.totalSupply().call();
        assert.equal(Number(totalSupply), 1010500);

        let gameAddress = await SpaceLeagueCurrency.methods.gameAddress().call();
        let gameAddressBalance = await SpaceLeagueCurrency.methods.balanceOf(gameAddress).call();

        await SpaceLeagueCurrency.methods.burnByGame(500).send({ from: gameAddress, gas: '100000' });

        totalSupply = await SpaceLeagueCurrency.methods.totalSupply().call();
        assert.equal(Number(totalSupply), (1010500 - 500));

        done();
      });

      
      it('Should subtract from the caller\'s balance', async (done) => {
        // returns 1 010 000
        let totalSupply = await SpaceLeagueCurrency.methods.totalSupply().call();
        assert.equal(Number(totalSupply), 1010000);

        let gameAddress = await SpaceLeagueCurrency.methods.gameAddress().call();
        let initialGameAddressBalance = await SpaceLeagueCurrency.methods.balanceOf(gameAddress).call();

        await SpaceLeagueCurrency.methods.burnByGame(500).send({ from: gameAddress, gas: '100000' });

        let finalGameAddressBalance = await SpaceLeagueCurrency.methods.balanceOf(gameAddress).call();
        
        // assert.equal(Number(initialGameAddressBalance), (Number(finalGameAddressBalance) - 500));
        assert.notEqual(initialGameAddressBalance, finalGameAddressBalance);
        
        done();
      });

      /*
      it('Should send ETH (amount burned * burnPercentage) to the burner', async (done) => {
        let initialEthBalance = await web3.eth.getBalance(accounts[1]);
        console.log('initialEthBalance: ', initialEthBalance);

        // await SpaceLeagueCurrency.methods.burn(500).send({ from: personTwo, gas: '100000' });

        // let finalEthBalance = await web3.eth.getBalance(personTwo);

        // assert.notEqual(initialEthBalance, finalEthBalance);

        done();
      });
      */

      it('Should emit event: Burn', async (done) => {
        let gameAddress = await SpaceLeagueCurrency.methods.gameAddress().call();

        let logs = await SpaceLeagueCurrency.methods.burnByGame(500).send({ from: gameAddress, gas: '100000' });
        
        let burner = logs.events.Burn.returnValues.burner,
            value = logs.events.Burn.returnValues.value;
        
        assert.equal(burner, gameAddress);
        assert.equal(Number(value), 500);

        done();
      });

      it('Should emit event: Transfer', async (done) => {
        let gameAddress = await SpaceLeagueCurrency.methods.gameAddress().call();

        let logs = await SpaceLeagueCurrency.methods.burnByGame(500).send({ from: gameAddress, gas: '100000' });
        
        let from = logs.events.Transfer.returnValues.from,
            to = logs.events.Transfer.returnValues.to,
            value = logs.events.Transfer.returnValues.value;
        
        assert.equal(from, gameAddress);
        assert.equal(to, '0x0000000000000000000000000000000000000000');
        assert.equal(Number(value), 500);
        done();
      });
    });
  });

});