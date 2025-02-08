// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract InsuranceEscrow {
    event NewInsurance(
        uint256 indexed id,
        address indexed token,
        uint256 indexed value
    );

    event PremiumPaid(uint256 indexed id, address indexed payer);

    event ClaimPaid(
        uint256 indexed id,
        address indexed receiver,
        uint256 indexed payout
    );

    struct Insurance {
        address receiver;
        address token;
        uint256 premium;
        uint256 payout;
        uint256 x;
        uint256 y;
        uint256 radius;
        bytes32 snarkId;
        uint256 value;
    }

    Insurance[] private _insurances;
    // Insurance ID => Account => Timestamp
    mapping(uint256 => mapping(address => uint256)) private _premiumTimestamps;

    constructor() {}

    function getInsurances() external view returns (Insurance[] memory) {
        return _insurances;
    }

    function getPremiumTimestamp(uint256 id, address account) external view returns (uint256) {
        return _premiumTimestamps[id][account];
    }

    function newInsurance(
        address receiver,
        address token,
        uint256 premium,
        uint256 payout,
        uint256 x,
        uint256 y,
        uint256 radius,
        bytes32 snarkId,
        uint256 value
    ) external returns (uint256 id) {
        IERC20(token).transferFrom(msg.sender, address(this), value);

        _insurances.push(
            Insurance(
                receiver,
                token,
                premium,
                payout,
                x,
                y,
                radius,
                snarkId,
                value
            )
        );

        id = _insurances.length;

        emit NewInsurance(id, token, value);
    }

    function payPremium(uint256 id) external {
        IERC20(_insurances[id].token).transferFrom(
            msg.sender,
            _insurances[id].receiver,
            _insurances[id].premium
        );

        _premiumTimestamps[id][msg.sender] = block.timestamp;

        emit PremiumPaid(id, msg.sender);
    }

    function requestPayout(uint256 id) external {
        if (block.timestamp - _premiumTimestamps[id][msg.sender] > 30 days) {
            revert("");
        }

        // TODO: Query disaster API
        // TODO: Query zkProof of location on Mina

        _insurances[id].value -= _insurances[id].payout;
        _premiumTimestamps[id][msg.sender] = 0;

        IERC20(_insurances[id].token).transfer(
            msg.sender,
            _insurances[id].payout
        );

        emit ClaimPaid(id, msg.sender, _insurances[id].payout);
    }
}
