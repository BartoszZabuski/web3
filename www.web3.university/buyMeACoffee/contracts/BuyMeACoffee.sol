// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract BuyMeACoffee {

    // event to emit when Memo is created
    // CHECK: indexed to make easier to search for addressed???
    event NewMemo(
        address indexed from, 
        uint256 timestamp,
        string name,
        string message
    );
    
    // Memo struct
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    // list all memos received
    Memo[] memos;

    // Address of contract deployer. This is where we will be withdrawing the money to.
     address payable public owner; 


    // Deploy logic!
    constructor() {
        owner = payable(msg.sender);
    }

    /**
     *  @dev buy a coffee for contract owner
     *  @param _name name of the coffee buyer
     *  @param _message a nice message from the coffee buyer
     */
    // CHECK: memory keyword
    // CHECK: payable keyword
    function buyACoffee(string memory _name, string memory _message) public payable {
        require(msg.value > 0, "Can't buy coffee with 0 ETH");
        
        // add Memo to storage
        memos.push(Memo(msg.sender, block.timestamp, _name, _message));

        // emit a log event when a new memo is created
        emit NewMemo(msg.sender, block.timestamp, _name, _message);
    }

    /**
     *  @dev sends entire balance stored in this contract to owner
     */
    function withdrawTips() public {
        require(owner.send(address(this).balance));
    }

    /**
     *  @dev retrieves all memos received and stored on the blockchain
     */
    function getMemos() public view returns(Memo[] memory) {
        return memos;
    }
    
    /**
     *  @dev balanceOf contract
     */
    function balanceOf() public view returns(uint256 balance){
        return address(this).balance;
    }
}
