// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {Test} from "forge-std/Test.sol";
import {Voting} from "../src/voting.sol";

contract VotingTest is Test{
    ///////////////////////
    // State variables
    //////////////////////
    Voting voting;
    string[] candidatesList; // just creating a variable

    uint256 DURATION = 1 days;

    ///////////////////////
    // Set Up
    //////////////////////
    function setUp() public{
        candidatesList = new string[](2); // dynamic allocating the memory at runtime (so array can be assigned)
        candidatesList[0] = "Bob";
        candidatesList[1] = "Alice";

        voting = new Voting(candidatesList, DURATION);

        // no need makeAddr unless testing from multiple accounts
    }

    /*
     * @notice "setUp()" for foundry format testing
     * @notice start with "test" in function for foundry format testing
     */

    ///////////////////////
    // Testing
    //////////////////////
    function testVotingOncePerUser() public{
        vm.warp(block.timestamp + DURATION - 1);

        voting.vote(0);

        vm.expectRevert(Voting.userHasAlreadyVoted.selector);
        voting.vote(1);
    }

    function testInvalidCandidate() public{
        vm.expectRevert(Voting.invalidCandidate.selector);
        voting.vote(2);
    }

    function testVotingDeadline() public{
        vm.warp(block.timestamp + DURATION + 1);

        vm.expectRevert(Voting.votingHasEnded.selector);
        voting.vote(0);
    }

    function testCallingWinnerSelectionBeforeDeadline() public{
        vm.warp(block.timestamp + DURATION - 1);

        vm.expectRevert(Voting.votingStillOngoing.selector);
        voting.getWinner();
    }

    function testWinnerSelection() public{
        address voter1 = makeAddr("voter1");
        address voter2 = makeAddr("voter2");

        voting.vote(0);
        vm.prank(voter1);
        voting.vote(1);
        vm.prank(voter2);
        voting.vote(0);

        vm.warp(block.timestamp + DURATION + 1);

        assertEq(voting.getWinner(), "Bob");
    }

    function testEventsEmission() public{
        vm.expectEmit(true, false, false, true);
        emit Voting.VoteCasted(address(this), "Bob");

        voting.vote(0);

        vm.expectEmit(true, false, false, true);
        emit Voting.WinnerDeclared("Bob");

        vm.warp(block.timestamp + DURATION + 1);
        voting.getWinner();
    }

    ///////////////////////
    // Edge Cases
    //////////////////////
    function testTieHandling() public{
        address voter1 = makeAddr("voter1");

        voting.vote(0);
        vm.prank(voter1);
        voting.vote(1);

        vm.warp(block.timestamp + DURATION + 1);

        assertEq(voting.getWinner(), "tie");
    }

    function testNoVotesCase() public{
        vm.warp(block.timestamp + DURATION + 1);

        assertEq(voting.getWinner(), "tie");
    }
}