// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "forge-std/console.sol";  // Useful for logging

interface IInsurance {
    function getInsurances() external view returns (address[] memory);
    function newInsurance(address receiver, uint256 premium, uint256 payout) external payable returns (uint256 id);
}

contract InsuranceTest is Test {

    IInsurance public insurance;

    address constant insuranceAddress = 0x593a4427bd598666aAfb888D490C94a4d2cFcd77;  // Address of the deployed contract

    function setUp() public {
        // Initialize the contract instance using the deployed address
        insurance = IInsurance(insuranceAddress);
    }

    function testGetInsurances() public {
        // Call the function to get insurances
        address[] memory insurances = insurance.getInsurances();
        assertTrue(insurances.length > 0, "No insurances found!");
    }

    function testNewInsurance() public {
        // Call the `newInsurance` function
        uint256 id = insurance.newInsurance{value: 1 ether}(address(0x123), 100, 1000);
        assertEq(id, 1, "Insurance ID should be 1");
    }

}
