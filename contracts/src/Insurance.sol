// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

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
}

contract GeoDistance {
    uint256 private constant R = 6371000 * 1e9; // Earth's radius in meters, scaled by 1e9
    uint256 private constant PI = 3141592653; // Approximate PI * 1e9 for integer math
    uint256 private constant SCALE = 1e9; // Scaling factor for lat/long

    // Convert degrees to radians (scaled by 1e9)
    function toRadians(int256 deg) internal pure returns (int256) {
        return (deg * int256(PI)) / 180;
    }

    // Haversine formula to calculate distance between two points
    function haversineDistance(
        int256 lat1, int256 lon1, 
        int256 lat2, int256 lon2
    ) public pure returns (uint256) {
        // Convert latitudes and longitudes from degrees to radians (scaled)
        int256 dLat = toRadians(lat2 - lat1);
        int256 dLon = toRadians(lon2 - lon1);

        int256 radLat1 = toRadians(lat1);
        int256 radLat2 = toRadians(lat2);

        // sin²(Δlat/2)
        uint256 sinDLat = sinSquared(dLat / 2);
        // sin²(Δlon/2)
        uint256 sinDLon = sinSquared(dLon / 2);

        // a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
        uint256 a = sinDLat + 
            (cos(radLat1) * cos(radLat2) / SCALE) * sinDLon;

        // c = 2 * atan2(√a, √(1−a))
        uint256 c = (2 * atan2(sqrt(a), sqrt(SCALE - a)));

        // Distance = R * c
        uint256 distance = (R * c) / SCALE;

        return distance / SCALE; // Return distance in meters
    }

    // Approximate sin²(x) using Taylor series (scaled)
    function sinSquared(int256 x) internal pure returns (uint256) {
        int256 sinX = (x - (x**3) / (6 * int256(SCALE)) + (x**5) / (120 * int256(SCALE))) / int256(SCALE);
        return uint256((sinX * sinX) / int256(SCALE));
    }

    // Approximate cos(x) using Taylor series (scaled)
    function cos(int256 x) internal pure returns (uint256) {
        return uint256((int256(SCALE) - (x**2) / (2 * int256(SCALE)) + (x**4) / (24 * int256(SCALE))) / int256(SCALE));
    }

    // Approximate sqrt using Babylonian method
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    // atan2 approximation
    function atan2(uint256 y, uint256 x) internal pure returns (uint256) {
        // Approximation for small values
        if (x == 0) return PI / 2;
        return (y * SCALE) / x; 
    }
}
