// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {Test} from "forge-std/Test.sol";
import {Fundraiser} from "../src/Fundraiser.sol";

contract FundraiserTest is Test{
    ////////////////////
    // State Variables
    ///////////////////
    Fundraiser public fundraiser;

    address public deployer;
    address public bob;
    address public alice;

    uint256 public constant FUNDRAISE_GOAL = 5 ether;
    uint256 public constant DURATION = 3 days;

    ////////////////////
    // Set Up
    ///////////////////
    function setUp() public{
        deployer = makeAddr("deployer");
        bob = makeAddr("bob");
        alice = makeAddr("alice");

        fundraiser = new Fundraiser(deployer, FUNDRAISE_GOAL, DURATION);

        // funding accounts
        vm.deal(deployer, 100 ether); 
        vm.deal(bob, 100 ether); 
        vm.deal(alice, 100 ether);
    }

    ////////////////////
    // Deposit Tests
    ///////////////////
    function testDepositFailAfterDeadlinePassed() public{
        // vm.warp to move timestamp forward
        vm.warp(block.timestamp + DURATION + 1);
        vm.expectRevert(Fundraiser.DeadlinePassed.selector);
        vm.prank(bob);
        fundraiser.deposit{value: 1 ether}(); // empty bracket because deposit() takes no parameter
    }

    function testDepositAccumulation() public{
        uint256 total = 2 ether;

        vm.prank(bob);
        fundraiser.deposit{value: 1 ether}();
        vm.prank(alice);
        fundraiser.deposit{value: 1 ether}();

        assertEq(fundraiser.totalRaised(), total); // totalRaised() = getter function for public state variable totalRaised

        assertEq(fundraiser.contributors(bob), 1 ether);
        assertEq(fundraiser.contributors(alice), 1 ether);
    }

    function testDepositEmitsEvent() public {
    address funder = bob;
    uint256 amount = 1 ether;

    // Expect the DepositMade event
    vm.expectEmit(true, false, false, true); // (1st, 2nd, 3rd, check data) boolean indicating which slot is being indexed(max of 3)
    emit Fundraiser.DepositMade(funder, amount);

    vm.prank(funder);
    fundraiser.deposit{value: amount}();
    }

    ////////////////////
    // Withdraw Tests
    ///////////////////
    function testWithdrawNotOwner() public{
        vm.prank(bob);
        fundraiser.deposit{value: 3 ether}();
        vm.prank(alice);
        fundraiser.deposit{value: 3 ether}();

        assertEq(fundraiser.totalRaised(), 6 ether);

        vm.prank(bob);
        vm.expectRevert(Fundraiser.NotAuthorized.selector);
        fundraiser.withdraw();
    }

    function testFundraisingGoalNotHit() public{
        vm.prank(bob);
        fundraiser.deposit{value: 3 ether}();

        assertEq(fundraiser.totalRaised(), 3 ether);

        vm.prank(deployer);
        vm.expectRevert(Fundraiser.GoalWasNotMet.selector);
        fundraiser.withdraw();
    }

    function testEmitwithdrawl() public{
        vm.prank(bob);
        fundraiser.deposit{value: 3 ether}();
        vm.prank(alice);
        fundraiser.deposit{value: 3 ether}();

        assertEq(fundraiser.totalRaised(), 6 ether);
        
        vm.expectEmit(true, true, false, true);
        emit Fundraiser.FundsWithdrawl(deployer, fundraiser.totalRaised());

        vm.prank(deployer);
        fundraiser.withdraw();
    }

    function testBalanceAfterWithdraw() public{
        uint256 beforeBalance = deployer.balance;

        vm.prank(bob);
        fundraiser.deposit{value: 3 ether}();
        vm.prank(alice);
        fundraiser.deposit{value: 3 ether}();

        assertEq(fundraiser.totalRaised(), 6 ether);

        vm.prank(deployer);
        fundraiser.withdraw();

        assertEq(deployer.balance, beforeBalance + 6 ether); 
    }

    ////////////////////
    // Refunds Tests
    ///////////////////
    function testRefundWhenGoalWasMet() public{
        vm.prank(bob);
        fundraiser.deposit{value: 3 ether}();
        vm.prank(alice);
        fundraiser.deposit{value: 3 ether}();

        assertEq(fundraiser.totalRaised(), 6 ether);
        vm.warp(block.timestamp + DURATION + 1);

        vm.expectRevert(Fundraiser.GoalWasMet.selector);

        vm.prank(bob);
        fundraiser.refund();
    }

    function testRefundsBeforeDeadline() public{
        vm.warp(block.timestamp + DURATION - 1); // block.timstamp + to move time forward; - to rewind

        vm.expectRevert(Fundraiser.DeadlineNotPassed.selector);
        vm.prank(bob);
        fundraiser.refund();
    }

    function testBalanceAfterRefund() public{
        uint256 balancebeforeRefund = bob.balance;

        vm.prank(bob);
        fundraiser.deposit{value: 3 ether}();

        assertEq(fundraiser.totalRaised(), 3 ether);

        vm.warp(block.timestamp + DURATION + 1);

        vm.prank(bob);
        fundraiser.refund();

        assertEq(fundraiser.contributors(bob), 0);
        assertEq(fundraiser.totalRaised(), 0);
        assertEq(bob.balance, balancebeforeRefund);
    }
    
    function testEmitRefund() public{
        vm.prank(bob);
        fundraiser.deposit{value: 3 ether}();

        assertEq(fundraiser.totalRaised(), 3 ether);

        vm.warp(block.timestamp + DURATION + 1);

        vm.expectEmit(true, false, false, true);
        emit Fundraiser.RefundIssued(bob, 3 ether);

        vm.prank(bob);
        fundraiser.refund();
    }

    ////////////////////
    // Status Tests
    ///////////////////
    function testStatusBeforeDeadLineAndGoalWasMet() public{
        vm.warp(block.timestamp + DURATION - 1);

        vm.prank(bob);
        fundraiser.deposit{value: 3 ether}();

        assertEq(fundraiser.totalRaised(), 3 ether);

        assertEq(uint(fundraiser.checkStatus()), uint(Fundraiser.fundraiserStatus.active)); // need to wrap enum in uint for assertEq
    
        vm.prank(deployer);
        vm.expectRevert(Fundraiser.GoalWasNotMet.selector);
        fundraiser.withdraw();

        // Non-owner should still fail
        vm.prank(bob);
        vm.expectRevert(Fundraiser.NotAuthorized.selector);
        fundraiser.withdraw();
    }

    function testStatusSuccessful() public{
        vm.prank(bob);
        fundraiser.deposit{value: 3 ether}();
        vm.prank(alice);
        fundraiser.deposit{value: 3 ether}();

        assertEq(fundraiser.totalRaised(), 6 ether);

        vm.warp(block.timestamp + DURATION + 1);

        assertEq(uint(fundraiser.checkStatus()), uint(Fundraiser.fundraiserStatus.successful));
        
        vm.prank(deployer);
        fundraiser.withdraw();

        // Non-owner should still fail
        vm.prank(bob);
        vm.expectRevert(Fundraiser.NotAuthorized.selector);
        fundraiser.withdraw();
    }

    function testStatusFailed() public{
        vm.prank(bob);
        fundraiser.deposit{value: 3 ether}();

        assertEq(fundraiser.totalRaised(), 3 ether);

        vm.warp(block.timestamp + DURATION + 1);

        assertEq(uint(fundraiser.checkStatus()), uint(Fundraiser.fundraiserStatus.failed));
    
        vm.prank(bob);
        fundraiser.refund();

        // Owner cannot withdraw, since goal not met
        vm.prank(deployer);
        vm.expectRevert(Fundraiser.GoalWasNotMet.selector);
        fundraiser.withdraw();
    }

    ////////////////////
    // Edge Cases
    ///////////////////
    function testDepositZero() public{
        vm.prank(alice);
        fundraiser.deposit{value: 3 ether}();
        vm.prank(bob);
        fundraiser.deposit{value: 0 ether}();
        vm.warp(block.timestamp + DURATION + 1);

        uint256 beforeBalance = bob.balance;
        uint256 beforeRaised = fundraiser.totalRaised();

        vm.prank(bob);
        fundraiser.refund();

        assertEq(bob.balance, beforeBalance);
        assertEq(fundraiser.totalRaised(), beforeRaised);
    }

    function testMultipleRefund() public{
        vm.prank(alice);
        fundraiser.deposit{value: 3 ether}();
        vm.prank(bob);
        fundraiser.deposit{value: 1 ether}();
        vm.warp(block.timestamp + DURATION + 1);

        uint256 beforeBalanceBob = bob.balance;
        uint256 beforeBalanceAlice = alice.balance;
        uint256 totalBeforeWithdraw = 4 ether;

        assertEq(fundraiser.totalRaised(), totalBeforeWithdraw);

        vm.prank(bob);
        fundraiser.refund();
        vm.prank(alice);
        fundraiser.refund();

        assertEq(bob.balance, beforeBalanceBob + 1 ether);
        assertEq(alice.balance, beforeBalanceAlice + 3 ether);
        assertEq(fundraiser.totalRaised(), 0);
    }

    function testEarlyWithdrawl() public{
        vm.prank(alice);
        fundraiser.deposit{value: 3 ether}();
        vm.prank(bob);
        fundraiser.deposit{value: 3 ether}();
        vm.warp(block.timestamp + DURATION - 1);

        vm.expectEmit(true, false, false, true);
        emit Fundraiser.FundsWithdrawl(deployer, fundraiser.totalRaised());
    
        vm.prank(deployer);
        fundraiser.withdraw();
    }

    function testRefundSetsContributorToZeroBeforeTransfer() public {
    vm.prank(bob);
    fundraiser.deposit{value: 1 ether}();

    vm.warp(block.timestamp + DURATION + 1);

    vm.prank(bob);
    fundraiser.refund();

    // After refund, contributor balance is zero
    assertEq(fundraiser.contributors(bob), 0);
    }

}