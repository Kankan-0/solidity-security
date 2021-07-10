//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import 'hardhat/console.sol';

// There are couple of ways to prevent reentrancy attacks
// 1. Use the transfer(forwards 2300 gas, which isn't enough for re entering the contract.) 
// method instead of CALL(forwards all available gas) whenever possible,
// 2. Use the check-effect-interaction pattern. That is first check all the conditions, then change
// the necessary states, and finally do the interactions. In the reentrancy attack, this pattern is violated
// and the state change is delayed and interaction is done before leading to the attack.
// 3. Use a mutex to lock the contract during code execution, so that reentrancy calls are avoided.

contract FixedReentrancy is Ownable {
    mapping (address=>uint) public balances;

    // 3. mutex solution
    bool reEntrancyMutex = false;

    constructor() public payable {
        balances[msg.sender] = msg.value;
    }

    function donate(address _to) public payable {
        unchecked {
            balances[_to] += msg.value;

        }
    }

    function balanceOf(address _who) public view returns(uint balance){
        return balances[_who];
    }


    function withdraw(uint _amount) public {
        // 3. mutex solution
        require(!reEntrancyMutex, 'One transaction is already in process');

        // 2. Check-effect-interactions pattern
        require(balances[msg.sender] >= _amount, "Account does not have enough balance");
    
        // 1. use of transfer instead of CALL solution.
        reEntrancyMutex = true;
        payable(msg.sender).transfer(_amount);

        // (bool success, bytes memory data) = msg.sender.call{value:_amount}("");
        // if (success) {
        //     unchecked{
        //         balances[msg.sender] -= _amount;
        //     }

        // } else {
        //     revert('Transaction failed');
        // }

        reEntrancyMutex = false;
        
    }

    function kill(address _target) public onlyOwner {
        selfdestruct(payable(_target));
    }
}