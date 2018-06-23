let net = require('net');
let Web3 = require('web3');
let web3 = new Web3(new Web3.providers.IpcProvider('./config/privnet/geth.ipc', net));

// get ABI
let itemFactory = require('./dist/contracts/ItemFactory.json');
let spaceLeagueCurrency = require('./dist/contracts/SpaceLeagueCurrency.json');

// get contract instances
let ItemFactory = new web3.eth.Contract(itemFactory.abiDefinition, itemFactory.deployedAddress);
let SpaceLeagueCurrency = new web3.eth.Contract(spaceLeagueCurrency.abiDefinition, spaceLeagueCurrency.deployedAddress);

let owner,
    EXAMPLE_MINT_PRICE = 15;

ItemFactory.events.OnBuyItem({
  fromBlock: 'latest'
}, (error, events) => {
  if (!error) {
    console.log(events);
  } else {
    console.log(error);
  }
});

SpaceLeagueCurrency.events.Transfer({
  fromBlock: 'latest'
}, (error, events) => {
  if (!error) {
    console.log(events);
  } else {
    console.log(error);
  }
});

async function test() {
  owner = await ItemFactory.methods.owner().call();

  // mint to make sure the sender has enough balance to approve
  // await SpaceLeagueCurrency.methods.mint(owner, 1000).send({ from: owner, gas: '1000000' });

  // 1. Call ERC20.approve() separately because it cannot be called from ItemFactory.buyItem()
  await SpaceLeagueCurrency.methods.approve(itemFactory.deployedAddress, EXAMPLE_MINT_PRICE).send({ from: owner, gas: '1000000' });

  let ownerBalance = await SpaceLeagueCurrency.methods.balanceOf(owner).call();
  console.log('ownerBalance 1: ', ownerBalance);

  // 2. Call: ItemFactory.buyItem() which fires the event: OnBuyItem.
  // It also fires: ERC20.transferFrom()
  await ItemFactory.methods.buyItem().send({ from: owner, gas: '1000000' })

  ownerBalance = await SpaceLeagueCurrency.methods.balanceOf(owner).call();
  console.log('ownerBalance 2: ', ownerBalance);

  let itemFactoryBalance = await SpaceLeagueCurrency.methods.balanceOf(itemFactory.deployedAddress).call();
  console.log('itemFactoryBalance: ', itemFactoryBalance);
}

test();