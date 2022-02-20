pragma solidity ^0.4.17;

// Lottery application that allows users to donate money for a "lottery" 
// with one winner at the end  that recieves all the money
contract Lottery {
    address public manager;
    address[] public players;
    uint public MINIMUM_PAYMENT = 0.01 ether;


    constructor() public{
        manager = msg.sender; // sets
    }

    // when someone enters the lottery
    function enter() public payable {
        // prevent someone sending along less than minimum required ether to join
        require(msg.value > MINIMUM_PAYMENT);
        // everyone that enters the lottery they have to send in some ether
        players.push(msg.sender); // using the global "msg" object that is automatically created when someone invokes the function

    }

    function randomGen() public view returns (uint) {
        return uint(keccak256(block.difficulty, now, players)); // converts data passed in into hash

    }

    function pickWinner() public restrictedToManager {
        uint winnerIndex = randomGen() % players.length; // find a random winner index for the players array
        players[winnerIndex].transfer(this.balance); // find that winner in our players array and transfer current instance's balance
        // creates a brand new dynamic array of type address to reset the lottery after picking a winner
        players = new address[](0); // (0) sets initial size of 0
        
    }

    modifier restrictedToManager() {
        // using require to make sure that only the manager is picking the winner
        require(msg.sender == manager); // checks if the manager is the same address as the manager - the one that originally created the contract
        _;
    }

    // return all players that have entered the lottery 
    function getPlayers() public view returns(address[]) {
        return players;
    }
}

/*
pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;
    
    function Lottery() public {
        manager = msg.sender;
    }
    
    function enter() public payable {
        require(msg.value > .01 ether);
        players.push(msg.sender);
    }
    
    function random() private view returns (uint) {
        return uint(keccak256(block.difficulty, now, players));
    }
    
    function pickWinner() public restricted {
        uint index = random() % players.length;
        players[index].transfer(this.balance);
        players = new address[](0);
    }
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    
    function getPlayers() public view returns (address[]) {
        return players;
    }
}   

*/