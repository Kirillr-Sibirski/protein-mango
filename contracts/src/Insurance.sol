// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract InsuranceEscrow {
    struct Vector2 {
        uint256 x;
        uint256 y;
    }

    struct Insurance {
        address receiver;
        address token;
        uint256 premium;
        uint256 payout;
        Vector2 location;
        uint256 radius;
        bytes32 snarkId;
        mapping(address => uint256) timestamps;
    }

    mapping(uint256 => Insurance) private _insurances;
    uint256 private _totalInsurances;

    constructor() {}

    function newInsurance(
        address receiver,
        address token,
        uint256 premium,
        uint256 payout,
        Vector2 memory location,
        uint256 radius,
        bytes32 snarkId,
        uint256 value
    ) external returns (uint256 id) {
        IERC20(token).transferFrom(msg.sender, address(this), value);

        id = _totalInsurances;
        _totalInsurances++;

        _insurances[id].receiver = receiver;
        _insurances[id].token = token;
        _insurances[id].premium = premium;
        _insurances[id].payout = payout;
        _insurances[id].location = location;
        _insurances[id].radius = radius;
        _insurances[id].snarkId = snarkId;
    }

    function payPremium(uint256 id) external {
        IERC20(_insurances[id].token).transferFrom(
            msg.sender,
            _insurances[id].receiver,
            _insurances[id].premium
        );

        _insurances[id].timestamps[msg.sender] = block.timestamp;
    }

    function requestPayout(uint256 id) external {
        // TODO: Query disaster API
        // TODO: Query zkProof of location on Mina

        IERC20(_insurances[id].token).transfer(
            msg.sender,
            _insurances[id].payout
        );

        _insurances[id].timestamps[msg.sender] = 0;
    }
}
