// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console} from "forge-std/Test.sol";
import {InsuranceEscrow} from "src/Insurance.sol";

contract InsuranceEscrowTest is Test {
    InsuranceEscrow insurance;

    function setUp() public {
        insurance = new InsuranceEscrow();
    }

    function testFlatEarthDistance() public view returns (bool) {
        // Coordinates in degrees, scaled by 1e9
        uint256 lat1 = 59_300_000_000; // 59.3°
        uint256 lon1 = 18_150_000_000; // 18.15°
        uint256 lat2 = 59_250_000_000; // 59.25°
        uint256 lon2 = 18_100_000_000; // 18.10°

        // Expected distance (approximate real-world value is ~6.1 km)
        uint256 expectedDistance = 6100; // 6.1 km in meters  61 605 000 000 000 000 000 000 000

        // Call the distance function
        uint256 calculatedDistance = insurance.calculateFlatEarthDistance(lat1, lon1, lat2, lon2);

        // Allow a small margin of error due to approximation
        uint256 tolerance = 100; // ±100 meters

        console.log("calculatedDistance: ", calculatedDistance, "expectedDistance: ", expectedDistance);
        // Check if the distance is within the expected range
        require(
            calculatedDistance >= (expectedDistance - tolerance) && 
            calculatedDistance <= (expectedDistance + tolerance),
            "Distance calculation is incorrect"
        );

        return true;
    }

    
}
