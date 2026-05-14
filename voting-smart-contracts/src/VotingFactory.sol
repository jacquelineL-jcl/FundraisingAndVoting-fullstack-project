// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {Voting} from "./voting.sol";

contract VotingFactory{
    address[] public allVotings;

    mapping (address => address[]) public ownervoting;

    event votingCreated(
        address indexed votingAddress,
        address indexed deployer,
        string[] candidates,
        uint256 deadline
    );

    function createVoting(string[] memory _candidates, uint256 _duration) public{
        Voting voting = new Voting(_candidates, _duration);

        allVotings.push(address(voting));
        ownervoting[msg.sender].push(address(voting));

        emit votingCreated(
            address(voting),
            msg.sender,
            _candidates,
            block.timestamp + _duration
        );
    }

    function getVotingContractByOwner(address _owner) public view returns(address[] memory){
        return ownervoting[_owner];
    }

    function getAllVotings() public view returns (address[] memory){
        return allVotings;
    }
}