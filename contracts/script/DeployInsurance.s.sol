// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import {InsuranceEscrow} from "src/Insurance.sol";

contract DeployInsuranceEscrow is Script {
    function run() external {
        // Get the deployer's private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the GeoDistance contract
        InsuranceEscrow insurance = new InsuranceEscrow();
        console.log("InsuranceEscrow deployed at:", address(insurance));

        // Stop broadcasting
        vm.stopBroadcast();
    }
}
