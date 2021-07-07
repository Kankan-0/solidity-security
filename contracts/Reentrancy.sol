//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "@openzeppelin/contracts/access/Ownable.sol";
import 'hardhat/console.sol';

contract Reentrancy is Ownable {
    using SafeMath for uint256;
    mapping (address=>uint) public balances;
    constructor() public payable {
        balances[msg.sender] = msg.value;
    }

    function donate(address _to) public payable {
        balances[_to] = balances[_to].add(msg.value);
    }

    function balanceOf(address _who) public view returns(uint balance){
        return balances[_who];
    }

    function withdraw(uint _amount) public {
        require(balances[msg.sender] >= _amount, "Account does not have enough balance");
        (bool success, bytes memory data) = msg.sender.call{value:_amount}("");
        if(success){
            balances[msg.sender] = balances[msg.sender].sub(_amount);
        }
    }

    function kill(address _target) public onlyOwner {
        selfdestruct(payable(_target));
    }
}