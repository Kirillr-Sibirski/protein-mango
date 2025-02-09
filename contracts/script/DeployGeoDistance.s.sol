// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "../lib/forge-std/src/Script.sol";
//import {InsuranceEscrow} from "../src/InsuranceEscrow.sol";
import {GeoDistance} from "../src/Insurance.sol";

contract DeployInsuranceEscrow is Script {
    function run() external {
        // Get the deployer's private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the GeoDistance contract
        GeoDistance geoDistance = new GeoDistance();
        console.log("GeoDistance deployed at:", address(geoDistance));

        // Stop broadcasting
        vm.stopBroadcast();
    }
}
