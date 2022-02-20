const assert = require('assert');
const ganache = require('ganache-cli'); // sets up local test network just by requiring in the file
const Web3 = require('web3');
const web3 = new Web3(ganache.provider()); // using web3 with ganache provider

const { interface, bytecode } = require('../compile.js');

let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: 2 });
});

describe('Lottery Contract', () => {
  it('deploys a contract', () => {
    assert.ok(lottery.options.address); // make sure the address that contract is deployed to is truthty
  });
});
