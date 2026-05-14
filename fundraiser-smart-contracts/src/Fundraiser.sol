// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

/*
 * @title Fundraiser
 * @author jc
 * @notice Allow people to deposit funds into the project
 * @notice Only owner can withdraw money
 * @notice Funding goal can only be set by owner 
 */

contract Fundraiser{
    ////////////////////
    // States variable
    ///////////////////
    address public deployer;
    uint256 public fundingGoal;
    uint256 public deadline;
    uint256 public totalRaised;
    fundraiserStatus public status;

    mapping(address => uint256) public contributors;

    enum fundraiserStatus {
        active,
        successful,
        failed
    }

    ////////////////////
    // Events
    ///////////////////
    event DepositMade(address indexed funder, uint256 value);
    event RefundIssued(address indexed funder, uint256 value);
    event FundsWithdrawl(address indexed deployer, uint256 amount);

    ////////////////////
    // Errors
    ///////////////////
    error DeadlinePassed();
    error DeadlineNotPassed();
    error TransactionFailed();
    error GoalWasMet();
    error FundraisingStatusMismatched();
    error NotAuthorized();
    error GoalWasNotMet();

    ////////////////////
    // Functions
    ///////////////////
    constructor(address _deployer, uint256 _fundingGoal, uint256 _duration){
        deployer = _deployer;
        fundingGoal = _fundingGoal;
        deadline = block.timestamp + _duration; // end time
        totalRaised = 0;
        status = fundraiserStatus.active;
    }

    function deposit() public payable{
        // 1. Conditions
        if (block.timestamp > deadline) revert DeadlinePassed();

        // 2. Record funding
        contributors[msg.sender] += msg.value;
        totalRaised += msg.value;

        // 3. Emit event
        emit DepositMade(msg.sender, msg.value);
    }

    function withdraw() public onlyOwner{
        // 1. Conditions
        if (totalRaised < fundingGoal) revert GoalWasNotMet();
        // No timeing needed in case of early withdrawals if requirements were met
        if (checkStatus() != fundraiserStatus.successful) revert FundraisingStatusMismatched();
        
        // 2. Transfer
        uint256 fundraisedAmount = address(this).balance;
        (bool success, ) = deployer.call{value: (fundraisedAmount)}("");
        if (!success) revert TransactionFailed();

        // 3. Emit
        emit FundsWithdrawl(deployer, fundraisedAmount);
    }

    function refund() public {
        // 1. Condition
        if (block.timestamp <= deadline) revert DeadlineNotPassed();
        if (totalRaised >= fundingGoal) revert GoalWasMet();
        if (checkStatus() != fundraiserStatus.failed) revert FundraisingStatusMismatched();

        // 2. Transfer & update
        uint256 refundAmount = contributors[msg.sender];
        contributors[msg.sender] = 0;
        totalRaised -= refundAmount;
        (bool success, ) = msg.sender.call{value: refundAmount}("");
        if(!success) revert TransactionFailed();

        // 3. Emit event
        emit RefundIssued(msg.sender, refundAmount);
    }

    function checkStatus() public view returns (fundraiserStatus) {
        if (totalRaised >= fundingGoal) {
            return fundraiserStatus.successful;
        } else if (block.timestamp >= deadline && totalRaised < fundingGoal) {
            return fundraiserStatus.failed;
        } else {
            return fundraiserStatus.active;
        }
    }

    ////////////////////
    // Modifier
    ///////////////////
    modifier onlyOwner{
        if(msg.sender != deployer) revert NotAuthorized();
        _;
    }
}