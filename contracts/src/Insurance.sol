// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {console} from "forge-std/Test.sol";

//import {IERC20} from "@openzeppelin/token/ERC20/IERC20.sol";
import {IERC20} from "@openzeppelin-contracts/token/ERC20/IERC20.sol";


//import {IJsonApiVerification} from "@flarenetwork/flare-periphery-contracts/coston/IJsonApiVerification.sol";
import {IJsonApiVerification} from "flare-periphery/src/coston/IJsonApiVerification.sol";
//import {IJsonApi} from "@flarenetwork/flare-periphery-contracts/coston/IJsonApi.sol";
import {IJsonApi} from "flare-periphery/src/coston/IJsonApi.sol";
//import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston/ContractRegistry.sol";
import {ContractRegistry} from "flare-periphery/src/coston/ContractRegistry.sol";

contract InsuranceEscrow {
    event NewInsurance(uint256 indexed id);

    event PremiumPaid(uint256 indexed id, address indexed payer);

    event ClaimPaid(
        uint256 indexed id,
        address indexed receiver,
        uint256 indexed payout
    );

    struct Insurance {
        address receiver;
        uint256 premium;
        uint256 payout;
        uint256 long;
        uint256 lat;
        uint256 radius;
        bytes32 snarkId;
        uint256 value;
    }

    struct QuakeDataTransportObject {
        uint256 mag;
        uint256 time;
        uint256 long;
        uint256 lat;
    }

    struct MinaDataTransportObject {
        address claimantAddress;
    }

    Insurance[] private _insurances;
    // Insurance ID => Account => Timestamp
    mapping(uint256 => mapping(address => uint256)) private _premiumTimestamps;

    constructor() {}

    function getInsurances() external view returns (Insurance[] memory) {
        return _insurances;
    }

    function getPremiumTimestamp(
        uint256 id,
        address account
    ) external view returns (uint256) {
        return _premiumTimestamps[id][account];
    }

    function newInsurance(
        address receiver,
        uint256 premium,
        uint256 payout,
        uint256 x,
        uint256 y,
        uint256 radius,
        bytes32 snarkId
    ) external payable returns (uint256 id) {
        if (msg.value < payout) {
            revert("");
        }

        _insurances.push(
            Insurance(
                receiver,
                premium,
                payout,
                x,
                y,
                radius,
                snarkId,
                msg.value
            )
        );
    
        id = _insurances.length;

        emit NewInsurance(id);
    }

    function payPremium(uint256 id) external payable {
        if (msg.value < _insurances[id].premium) {
            revert("");
        }

        _premiumTimestamps[id][msg.sender] = block.timestamp;

        emit PremiumPaid(id, msg.sender);
    }


    function isJsonApiProofValid(
        IJsonApi.Proof calldata _proof
    ) public view returns (bool) {
        // Inline the check for now until we have an official contract deployed
        return
            ContractRegistry.auxiliaryGetIJsonApiVerification().verifyJsonApi(
                _proof
            );
    }

    function requestPayout(IJsonApi.Proof calldata minaData, IJsonApi.Proof calldata quakeData, uint256 id) external {
        if (block.timestamp - _premiumTimestamps[id][msg.sender] > 30 days) {
            revert("");
        }
        require(isJsonApiProofValid(minaData), "Invalid Mina proof");
        require(isJsonApiProofValid(quakeData), "Invalid quake proof");

        // TODO: Query disaster API
        QuakeDataTransportObject memory qdto = abi.decode(
            quakeData.data.responseBody.abi_encoded_data,
            (QuakeDataTransportObject)
        );
        uint256 distance = calculateFlatEarthDistance(qdto.long, qdto.lat, _insurances);

        // TODO: Query zkProof of location on Mina
        MinaDataTransportObject memory mdto = abi.decode(
            minaData.data.responseBody.abi_encoded_data,
            (MinaDataTransportObject)
        );
        address claimantAddress = mdto.claimantAddress;

        _insurances[id].value -= _insurances[id].payout;
        _premiumTimestamps[id][msg.sender] = 0;

        (bool sent,) = msg.sender.call{value: _insurances[id].payout}("");
        if(!sent) {
            revert("");
        }

        emit ClaimPaid(id, msg.sender, _insurances[id].payout);
    }

    // Distance calculation which assumes a flat earth
    // TODO Implement simplified Haversine calculation instead
    function calculateFlatEarthDistance(
        uint lat1, uint lon1, 
        uint lat2, uint lon2
    ) public pure returns (uint) {
        // Constants for converting degrees to meters (rough approximation)
        uint metersPerLatitude = 111000; // meters per degree of latitude (roughly)

        // Calculate absolute differences
        uint deltaLat = lat2 > lat1 ? lat2 - lat1 : lat1 - lat2;
        uint deltaLon = lon2 > lon1 ? lon2 - lon1 : lon1 - lon2;

        // Simple Pythagorean theorem (no curvature)
        uint distance = (deltaLat * metersPerLatitude)**2 + (deltaLon * metersPerLatitude)**2;

        return distance / 10**22;
    }
}


