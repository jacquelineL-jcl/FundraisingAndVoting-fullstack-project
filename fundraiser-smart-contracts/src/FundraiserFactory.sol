// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {Fundraiser} from "../src/Fundraiser.sol";  // Import your Fundraiser contract;

contract FundraiserFactory {
    // 🔹 Store all deployed fundraiser addresses
    address[] public allFundraisers;

    // 🔹 Map each owner to their deployed fundraisers
    mapping(address => address[]) public ownerFundraisers;

    // 🔹 Event emitted whenever a new fundraiser is created
    event FundraiserCreated(
        address indexed fundraiserAddress,
        address indexed deployer,
        uint256 fundingGoal,
        uint256 deadline
    );

    // 🔹 Deploy a new fundraiser contract
    function createFundraiser(uint256 _fundingGoal, uint256 _duration) public {
        // Deploy new fundraiser with parameters
        Fundraiser fundraiser = new Fundraiser(msg.sender, _fundingGoal, _duration);

        // Save globally
        allFundraisers.push(address(fundraiser));

        // Save under deployer’s list
        ownerFundraisers[msg.sender].push(address(fundraiser));

        // Emit event for frontend
        emit FundraiserCreated(
            address(fundraiser),
            msg.sender,
            _fundingGoal,
            block.timestamp + _duration
        );
    }

    // 🔹 Get all fundraisers deployed by a specific owner
    function getFundraisersByOwner(address _owner) public view returns (address[] memory) {
        return ownerFundraisers[_owner];
    }

    // 🔹 Get all fundraisers deployed overall
    function getAllFundraisers() public view returns (address[] memory) {
        return allFundraisers;
    }
}
