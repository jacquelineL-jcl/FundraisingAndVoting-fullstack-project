// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {Script} from "forge-std/Script.sol";
import {VotingFactory} from "../src/VotingFactory.sol";
import {console} from "forge-std/console.sol";

contract VotingDeploy is Script{
    uint256 constant DURATION = 5 days;

    function run() external{
        vm.startBroadcast();

        VotingFactory factory = new VotingFactory();
        console.log("VotingFactory deployed at:", address(factory));

        vm.stopBroadcast();
    }
}