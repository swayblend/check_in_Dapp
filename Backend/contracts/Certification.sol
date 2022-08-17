// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Certification {
    uint256 checkedIn;

    /*
     * We will be using this below to help generate a random number
     */
    uint256 private seed;

    event NewCheck(address indexed from, uint256 timestamp, string message);

    // address[] public attendees;

    // mapping(address => uint256) public attendeeToAttendanceCount;

    struct CheckedIn {
        address attendee;
        string message;
        uint256 timestamp;
    }

    CheckedIn[] checks;

    /*
     * This is an address => uint mapping, meaning I can associate an address with a number!
     * In this case, I'll be storing the address with the last time the user checked in with us.
     */
    mapping(address => uint256) public lastCheckInAt;

    constructor() payable {
        console.log("Certification.sol has successfully been deployed!");
        /*
         * Set the initial seed
         */
        seed = (block.timestamp + block.difficulty) % 100;
    }

    // function checkIn() public {
    //     checkedIn += 1;
    //     attendees.push(msg.sender);
    //     attendeeToAttendanceCount[msg.sender]++;
    //     console.log("%s has checked in!", msg.sender);
    // }

    function checkIn(string memory _message) public {
        /*
         * We need to make sure the current timestamp is at least 15-minutes bigger than the last timestamp we stored
         */
        require(
            lastCheckInAt[msg.sender] + 30 seconds < block.timestamp,
            "Must wait 30 seconds before next check in."
        );

        /*
         * Update the current timestamp we have for the user
         */
        lastCheckInAt[msg.sender] = block.timestamp;
        checkedIn += 1;
        console.log("%s has checked in!", msg.sender);

        checks.push(CheckedIn(msg.sender, _message, block.timestamp));
        /*
         * Generate a new seed for the next user that sends a wave
         */
        seed = (block.difficulty + block.timestamp + seed) % 100;

        console.log("Random # generated: %d", seed);

        /*
         * Give a 50% chance that the user wins the prize.
         */
        if (seed < 50) {
            console.log("%s won!", msg.sender);

            /*
             * The same code we had before to send the prize.
             */

            uint256 incentiveAmount = 0.0001 ether;
            require(
                incentiveAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = (msg.sender).call{value: incentiveAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }

        emit NewCheck(msg.sender, block.timestamp, _message);
    }

    function getAllCheckedIns() public view returns (CheckedIn[] memory) {
        return checks;
    }

    function getTotalCheckIns() public view returns (uint256) {
        console.log("We have %d total check-in's!", checkedIn);
        console.log("---------------------------------------");
        return checkedIn;
    }
}
