# Space League
An Ethereum based RPG.

### Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

#### Prerequisites
What things you need to install the software and how to install them

Installing the Truffle framework on your machine:
> $ npm install truffle -g

Installing Ganache CLI (Ethereum blockchain simulator):
> $ npm install ganache-cli -g

#### Installing
A step by step series of examples that tell you how to get a development env running

Cloning the repository:
> $ git clone git@github.com:botanki/space-league.git

Change into the repository's directory and install dependencies:
> $ cd space-league && npm install

Start Ganache CLI:
> $ ganache-cli -i 919293 --deterministic

Open up a second terminal to compile & migrate (deploy) the contracts to the development network:
> $ truffle compile && truffle migrate --network=development

To test the Node.js file, open up a third terminal:
> $ node server.js

# Built With
* [Truffle](https://github.com/trufflesuite/truffle)

# Authors
* [Karzan Botani](https://github.com/botanki)
* [Daniel R](https://github.com/DanielRX)

# License
> to be continued