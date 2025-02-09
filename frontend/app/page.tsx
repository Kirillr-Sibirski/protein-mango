"use client";

import { createThirdwebClient, defineChain, getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { ConnectButton, useActiveAccount } from "thirdweb/react";

export default function Home() {
	const activeAccount = useActiveAccount();

	const handleTxn = async () => {
		if (!activeAccount) {
			return;
		}

		const contract = getContract({
			client: createThirdwebClient({
				clientId: "46f89a93ab6373445b8219c6267a3c0c"
			}),
			abi: [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "receiver", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "payout", "type": "uint256" }], "name": "ClaimPaid", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "NewInsurance", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "payer", "type": "address" }], "name": "PremiumPaid", "type": "event" }, { "inputs": [{ "internalType": "uint256", "name": "lat1", "type": "uint256" }, { "internalType": "uint256", "name": "lon1", "type": "uint256" }, { "internalType": "uint256", "name": "lat2", "type": "uint256" }, { "internalType": "uint256", "name": "lon2", "type": "uint256" }], "name": "calculateFlatEarthDistance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "pure", "type": "function" }, { "inputs": [], "name": "getInsurances", "outputs": [{ "components": [{ "internalType": "address", "name": "receiver", "type": "address" }, { "internalType": "uint256", "name": "premium", "type": "uint256" }, { "internalType": "uint256", "name": "payout", "type": "uint256" }, { "internalType": "uint256", "name": "long", "type": "uint256" }, { "internalType": "uint256", "name": "lat", "type": "uint256" }, { "internalType": "uint256", "name": "radius", "type": "uint256" }, { "internalType": "string", "name": "snarkId", "type": "string" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "internalType": "struct InsuranceEscrow.Insurance[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "address", "name": "account", "type": "address" }], "name": "getPremiumTimestamp", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "bytes32[]", "name": "merkleProof", "type": "bytes32[]" }, { "components": [{ "internalType": "bytes32", "name": "attestationType", "type": "bytes32" }, { "internalType": "bytes32", "name": "sourceId", "type": "bytes32" }, { "internalType": "uint64", "name": "votingRound", "type": "uint64" }, { "internalType": "uint64", "name": "lowestUsedTimestamp", "type": "uint64" }, { "components": [{ "internalType": "string", "name": "url", "type": "string" }, { "internalType": "string", "name": "postprocessJq", "type": "string" }, { "internalType": "string", "name": "abi_signature", "type": "string" }], "internalType": "struct IJsonApi.RequestBody", "name": "requestBody", "type": "tuple" }, { "components": [{ "internalType": "bytes", "name": "abi_encoded_data", "type": "bytes" }], "internalType": "struct IJsonApi.ResponseBody", "name": "responseBody", "type": "tuple" }], "internalType": "struct IJsonApi.Response", "name": "data", "type": "tuple" }], "internalType": "struct IJsonApi.Proof", "name": "_proof", "type": "tuple" }], "name": "isJsonApiProofValid", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "receiver", "type": "address" }, { "internalType": "uint256", "name": "premium", "type": "uint256" }, { "internalType": "uint256", "name": "payout", "type": "uint256" }, { "internalType": "uint256", "name": "x", "type": "uint256" }, { "internalType": "uint256", "name": "y", "type": "uint256" }, { "internalType": "uint256", "name": "radius", "type": "uint256" }, { "internalType": "string", "name": "snarkId", "type": "string" }], "name": "newInsurance", "outputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "payPremium", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "bytes32[]", "name": "merkleProof", "type": "bytes32[]" }, { "components": [{ "internalType": "bytes32", "name": "attestationType", "type": "bytes32" }, { "internalType": "bytes32", "name": "sourceId", "type": "bytes32" }, { "internalType": "uint64", "name": "votingRound", "type": "uint64" }, { "internalType": "uint64", "name": "lowestUsedTimestamp", "type": "uint64" }, { "components": [{ "internalType": "string", "name": "url", "type": "string" }, { "internalType": "string", "name": "postprocessJq", "type": "string" }, { "internalType": "string", "name": "abi_signature", "type": "string" }], "internalType": "struct IJsonApi.RequestBody", "name": "requestBody", "type": "tuple" }, { "components": [{ "internalType": "bytes", "name": "abi_encoded_data", "type": "bytes" }], "internalType": "struct IJsonApi.ResponseBody", "name": "responseBody", "type": "tuple" }], "internalType": "struct IJsonApi.Response", "name": "data", "type": "tuple" }], "internalType": "struct IJsonApi.Proof", "name": "minaData", "type": "tuple" }, { "components": [{ "internalType": "bytes32[]", "name": "merkleProof", "type": "bytes32[]" }, { "components": [{ "internalType": "bytes32", "name": "attestationType", "type": "bytes32" }, { "internalType": "bytes32", "name": "sourceId", "type": "bytes32" }, { "internalType": "uint64", "name": "votingRound", "type": "uint64" }, { "internalType": "uint64", "name": "lowestUsedTimestamp", "type": "uint64" }, { "components": [{ "internalType": "string", "name": "url", "type": "string" }, { "internalType": "string", "name": "postprocessJq", "type": "string" }, { "internalType": "string", "name": "abi_signature", "type": "string" }], "internalType": "struct IJsonApi.RequestBody", "name": "requestBody", "type": "tuple" }, { "components": [{ "internalType": "bytes", "name": "abi_encoded_data", "type": "bytes" }], "internalType": "struct IJsonApi.ResponseBody", "name": "responseBody", "type": "tuple" }], "internalType": "struct IJsonApi.Response", "name": "data", "type": "tuple" }], "internalType": "struct IJsonApi.Proof", "name": "quakeData", "type": "tuple" }, { "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "requestPayout", "outputs": [], "stateMutability": "nonpayable", "type": "function" }],
			address: "0x345D747ad0556FB930A289eb0b1BA54eC4e0c428",
			chain: defineChain({
				id: 114,
				rpc: "https://coston2-api.flare.network/ext/C/rpc"
			}),
		});

		const transaction = prepareContractCall({
			contract,
			method: "newInsurance",
			params: [
				activeAccount.address,
				1n,
				1n,
				1n,
				1n,
				1n,
				"test"
			],
			value: 100n
		});

		const { transactionHash } = await sendTransaction({
			account: activeAccount,
			transaction: transaction
		});
		console.log(transactionHash)
	};

	return (
		<div>
			<ConnectButton
				client={createThirdwebClient({
					clientId: "46f89a93ab6373445b8219c6267a3c0c"
				})}
				chain={defineChain({
					id: 114,
					rpc: "https://coston2-api.flare.network/ext/C/rpc"
				})}
			/>
			<button
				className="bg-gray-400"
				onClick={handleTxn}
			>
				Txn
			</button>
		</div>
	);
}
