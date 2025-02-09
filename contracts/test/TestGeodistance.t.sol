// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "src/Insurance.sol";

contract GeoDistanceTest is Test {
    GeoDistance geoDistance;

    function setUp() public {
        geoDistance = new GeoDistance();
    }

    function testHaversineDistance() public {
        // Coordinates for two locations (Example: Paris and London)
        int256 lat1 = 482520000; // Paris latitude in scaled degrees (48.252°)
        int256 lon1 = 227400000; // Paris longitude in scaled degrees (2.274°)
        int256 lat2 = 514130000; // London latitude in scaled degrees (51.413°)
        int256 lon2 = -214500000; // London longitude in scaled degrees (-0.2145°)

        // Expected result (calculated manually or from a reliable source)
        // The actual distance should be close to 343.2 km
        uint256 expectedDistance = 343200000000; // Scaled distance in meters (343.2 km * 1e9)

        // Call the haversineDistance function
        uint256 distance = geoDistance.haversineDistance(lat1, lon1, lat2, lon2);

        
        // Check that the distance is approximately correct
        assertApproxEqAbs(distance, expectedDistance, 1000000); // Allow a small margin of error (1 meter)
    }
}
