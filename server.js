// ganache-cli -i 919293 --deterministic
// truffle compile && truffle migrate --network=development
const express = require('express'),
      bodyParser = require('body-parser'),
      mintRoutes = require('./routes/mint.route'), // Imports routes for the products.
      app = express(),
      mongoose = require('mongoose'),
      axios = require('axios'),
      querystring = require('querystring'),
      Web3 = require('web3'),
      itemFactory = require('./build/contracts/ItemFactory.json'),
      spaceLeagueCurrency = require('./build/contracts/SpaceLeagueCurrency.json');

// Set web3 provider.
let web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

// Contract addresses.
const itemFactoryAddress = itemFactory.networks[919293].address;
const spaceLeagueCurrencyAddress = spaceLeagueCurrency.networks[919293].address;

// Get contract instances.
const ItemFactory = new web3.eth.Contract(itemFactory.abi, itemFactoryAddress);
const SpaceLeagueCurrency = new web3.eth.Contract(spaceLeagueCurrency.abi, spaceLeagueCurrencyAddress);

let dev_db_url = 'mongodb://admin:admin123@ds251807.mlab.com:51807/spl';
let mongoDB = process.env.MONGODB_URI || dev_db_url;

mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/mints', mintRoutes);

// Base URL for axios requests.
axios.defaults.baseURL = 'http://localhost:3000';

let accounts,
    owner,
    EXAMPLE_MINT_PRICE;

// Event watcher.
ItemFactory.events.OnBuyItem({
  fromBlock: 'latest'
}, (error, events) => {
  let blockNumber = events.returnValues.blockNumber,
      player = events.returnValues.player;

  axios.post('/mints/create',
    querystring.stringify({
      blockNumber: Number(blockNumber),
      player: player,
      status: 'pending'
    })
  );
});

async function testBuy() {
  accounts = await web3.eth.getAccounts();
  owner = await SpaceLeagueCurrency.methods.owner().call();
  EXAMPLE_MINT_PRICE = await ItemFactory.methods.EXAMPLE_MINT_PRICE().call();

  // Mint tokens. Make sure that accounts[1] has enough balance.
  await SpaceLeagueCurrency.methods.mint(accounts[1], EXAMPLE_MINT_PRICE).send({ from: owner, gas: '1000000' });

  // Call SPC.approve() on ItemFactory address. Because of SPC.transferFrom().
  await SpaceLeagueCurrency.methods.approve(itemFactoryAddress, EXAMPLE_MINT_PRICE).send({ from: accounts[1], gas: '1000000' });

  // Call ItemFactory.buyItem()
  await ItemFactory.methods.buyItem().send({ from: accounts[1], gas: '6000000' });
}

testBuy();

// Get all.
// axios.get('/mints/')
//   .then(res => {
//     console.log(res.data);
//   })
//   .catch(err => {
//     console.log(err);
//   });

app.listen(3000, () => {
  console.log('Listening on port 3000!');
});