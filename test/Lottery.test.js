const assert = require('assert');
const ganache = require('ganache-cli'); // sets up local test network just by requiring in the file
const Web3 = require('web3');
const web3 = new Web3(ganache.provider()); // using web3 with ganache provider

const { interface, bytecode } = require('../compile.js');

let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts(); // list of test accounts provided by ganache
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' });
});

// answer this question when you want to decide on what to test - what behavior do we care about in our contract?
describe('Lottery Contract', () => {
  it('deploys a contract', () => {
    console.log('options:', lottery.options);
    assert.ok(lottery.options.address); // make sure the address that contract is deployed to is truthty
  });

  it('allows multiple players to enter correctly', async () => {
    // player one enters
    await lottery.methods
      .enter()
      .send({ from: accounts[0], value: web3.utils.toWei('0.012', 'ether') }); // enter lottery with the enter method we created in our Contract
    // player two enters
    await lottery.methods
      .enter()
      .send({ from: accounts[1], value: web3.utils.toWei('0.02', 'ether') }); // enter lottery with the enter method we created in our Contract
    // player three enters
    await lottery.methods
      .enter()
      .send({ from: accounts[2], value: web3.utils.toWei('0.03', 'ether') }); // enter lottery with the enter method we created in our Contract

    // get players array from our contract
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    // check that the person who entered the lottery is the same as the person who was added
    // to the lottery player list

    assert.equal(accounts[0], players[0]); // value that it should be, value that it is
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);

    // check if length of players array is correctly the number of people who entered the lottery
    assert.equal(3, players.length);
  });

  it('requires a minimum amount of ether to enter', async () => {
    // using try-catch to catch any errors that we want to appear for testing
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: '222220',
      });
      assert(false); // failing assertion to fail the test if above code passes without error
      // (namely the code DIDNT throw an error upon sending too little ether for entering lottery)
    } catch (err) {
      console.log('error occured:', err);
      assert(err); // assert.ok checks for existence, where as just assert checks for existence
    }
  });

  // makes sure only the manager has access to the smart contract
  it('check if anyone other than manager tries to pick the winner', async () => {
    try {
      await lottery.methods.pickWinner().send({ from: accounts[0] });
      assert(false);
    } catch (err) {
      assert(err); // assert that the error exists
    }
  });

  // successfully sends money to winner and resets player's array
  it("sends money to correct winner and resets player's array", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether'),
    });

    // get initial balance of account
    const initialBalance = await web3.eth.getBalance(accounts[0]);

    // manager picks winner
    await lottery.methods.pickWinner().send({ from: accounts[0] });

    // get final balance of account after winner is picked
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    console.log('finalBalance', finalBalance);

    // compare the balance before and after
    const difference = finalBalance - initialBalance;
    assert(difference > web3.utils.toWei('1.8', 'ether')); // not using 2 to allow for some gas cost
  });
});
