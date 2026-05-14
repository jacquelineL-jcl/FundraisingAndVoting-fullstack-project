// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

contract Voting {
    ///////////////////////
    // State variables
    //////////////////////
    uint256 public endTime;
    string[] public candidates;
    mapping(address => bool) hasVoted;
    uint256[] public votes;
    
    ///////////////////////
    // Events
    //////////////////////
    event VoteCasted(address indexed voter, string candidate);
    event WinnerDeclared(string candidate);

    ///////////////////////
    // Errors
    //////////////////////
    error votingHasEnded();
    error userHasAlreadyVoted();
    error invalidCandidate();
    error votingStillOngoing();

    ///////////////////////
    // Constructor
    ////////////////////// 
    constructor(string[] memory _candidates, uint256 _duration) {
        candidates = _candidates;
        endTime = block.timestamp + _duration;

        votes = new uint256[](_candidates.length);
    }

    ///////////////////////
    // Functions
    //////////////////////
    function vote (uint256 candidateIndex) public{
        if (block.timestamp >= endTime) revert votingHasEnded();
        if (hasVoted[msg.sender] == true) revert userHasAlreadyVoted();
        if (candidateIndex >= candidates.length) revert invalidCandidate();

        hasVoted[msg.sender] = true;
        votes[candidateIndex]++;

        emit VoteCasted(msg.sender, candidates[candidateIndex]);
    }

    function getWinner() public view returns (string memory) {
        if (block.timestamp < endTime) revert votingStillOngoing();

        uint256 highestVotes = 0;
        uint256 winnerIndex = 0;
        bool tie = false;

        for (uint256 i = 0; i < candidates.length; ++i) {
            if (votes[i] > highestVotes) {
                highestVotes = votes[i];
                winnerIndex = i;
                tie = false;
            } else if (votes[i] == highestVotes && votes[i] != 0) {
                tie = true;
            }
    }

    if (highestVotes == 0 || tie) return "tie";
    return candidates[winnerIndex];
    }

    function getVoteCount(uint256 candidateIndex) public view returns (uint256) {
        if (candidateIndex >= candidates.length) revert invalidCandidate();
        return votes[candidateIndex];
    }

    function getCandidateLength() public view returns (uint256){
        return candidates.length;
    }

}