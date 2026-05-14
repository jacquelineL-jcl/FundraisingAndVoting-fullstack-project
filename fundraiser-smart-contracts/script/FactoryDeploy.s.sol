// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {Script} from "forge-std/Script.sol";
import {FundraiserFactory} from "../src/FundraiserFactory.sol";
import {console} from "forge-std/console.sol";

contract FactoryDeploy is Script {
    function run() external {
        // Start broadcasting transactions
        vm.startBroadcast();

        // Deploy the factory contract
        FundraiserFactory factory = new FundraiserFactory();

        // Log the deployed address
        console.log("FundraiserFactory deployed at:", address(factory));

        // Stop broadcasting
        vm.stopBroadcast();
    }
}