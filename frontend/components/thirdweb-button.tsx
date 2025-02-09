"use client";

import { createThirdwebClient, defineChain, getContract } from "thirdweb";
import { ConnectButton } from "thirdweb/react";

export const thirdwebClient = createThirdwebClient({
    clientId: "46f89a93ab6373445b8219c6267a3c0c"
});

export const flareTestnet = defineChain({
    id: 114,
    rpc: "https://coston2-api.flare.network/ext/C/rpc"
});

export const insuranceEscrow = getContract({
    client: createThirdwebClient({
        clientId: "46f89a93ab6373445b8219c6267a3c0c"
    }),
    abi: [
        {
            "type": "constructor",
            "inputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "calculateFlatEarthDistance",
            "inputs": [
                {
                    "name": "lat1",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "lon1",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "lat2",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "lon2",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "getInsurances",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "tuple[]",
                    "internalType": "struct InsuranceEscrow.Insurance[]",
                    "components": [
                        {
                            "name": "receiver",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "premium",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "payout",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "long",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "lat",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "radius",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "snarkId",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "value",
                            "type": "uint256",
                            "internalType": "uint256"
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getInsurancesByUser",
            "inputs": [
                {
                    "name": "user",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "tuple[]",
                    "internalType": "struct InsuranceEscrow.InsuranceAndExpiry[]",
                    "components": [
                        {
                            "name": "id",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "expiryTimestamp",
                            "type": "uint256",
                            "internalType": "uint256"
                        }
                    ]
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "getPremiumTimestamp",
            "inputs": [
                {
                    "name": "id",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "account",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "isJsonApiProofValid",
            "inputs": [
                {
                    "name": "_proof",
                    "type": "tuple",
                    "internalType": "struct IJsonApi.Proof",
                    "components": [
                        {
                            "name": "merkleProof",
                            "type": "bytes32[]",
                            "internalType": "bytes32[]"
                        },
                        {
                            "name": "data",
                            "type": "tuple",
                            "internalType": "struct IJsonApi.Response",
                            "components": [
                                {
                                    "name": "attestationType",
                                    "type": "bytes32",
                                    "internalType": "bytes32"
                                },
                                {
                                    "name": "sourceId",
                                    "type": "bytes32",
                                    "internalType": "bytes32"
                                },
                                {
                                    "name": "votingRound",
                                    "type": "uint64",
                                    "internalType": "uint64"
                                },
                                {
                                    "name": "lowestUsedTimestamp",
                                    "type": "uint64",
                                    "internalType": "uint64"
                                },
                                {
                                    "name": "requestBody",
                                    "type": "tuple",
                                    "internalType": "struct IJsonApi.RequestBody",
                                    "components": [
                                        {
                                            "name": "url",
                                            "type": "string",
                                            "internalType": "string"
                                        },
                                        {
                                            "name": "postprocessJq",
                                            "type": "string",
                                            "internalType": "string"
                                        },
                                        {
                                            "name": "abi_signature",
                                            "type": "string",
                                            "internalType": "string"
                                        }
                                    ]
                                },
                                {
                                    "name": "responseBody",
                                    "type": "tuple",
                                    "internalType": "struct IJsonApi.ResponseBody",
                                    "components": [
                                        {
                                            "name": "abi_encoded_data",
                                            "type": "bytes",
                                            "internalType": "bytes"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "newInsurance",
            "inputs": [
                {
                    "name": "receiver",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "premium",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "payout",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "x",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "y",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "radius",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "snarkId",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "outputs": [
                {
                    "name": "id",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "payPremium",
            "inputs": [
                {
                    "name": "id",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "requestPayout",
            "inputs": [
                {
                    "name": "minaData",
                    "type": "tuple",
                    "internalType": "struct IJsonApi.Proof",
                    "components": [
                        {
                            "name": "merkleProof",
                            "type": "bytes32[]",
                            "internalType": "bytes32[]"
                        },
                        {
                            "name": "data",
                            "type": "tuple",
                            "internalType": "struct IJsonApi.Response",
                            "components": [
                                {
                                    "name": "attestationType",
                                    "type": "bytes32",
                                    "internalType": "bytes32"
                                },
                                {
                                    "name": "sourceId",
                                    "type": "bytes32",
                                    "internalType": "bytes32"
                                },
                                {
                                    "name": "votingRound",
                                    "type": "uint64",
                                    "internalType": "uint64"
                                },
                                {
                                    "name": "lowestUsedTimestamp",
                                    "type": "uint64",
                                    "internalType": "uint64"
                                },
                                {
                                    "name": "requestBody",
                                    "type": "tuple",
                                    "internalType": "struct IJsonApi.RequestBody",
                                    "components": [
                                        {
                                            "name": "url",
                                            "type": "string",
                                            "internalType": "string"
                                        },
                                        {
                                            "name": "postprocessJq",
                                            "type": "string",
                                            "internalType": "string"
                                        },
                                        {
                                            "name": "abi_signature",
                                            "type": "string",
                                            "internalType": "string"
                                        }
                                    ]
                                },
                                {
                                    "name": "responseBody",
                                    "type": "tuple",
                                    "internalType": "struct IJsonApi.ResponseBody",
                                    "components": [
                                        {
                                            "name": "abi_encoded_data",
                                            "type": "bytes",
                                            "internalType": "bytes"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "quakeData",
                    "type": "tuple",
                    "internalType": "struct IJsonApi.Proof",
                    "components": [
                        {
                            "name": "merkleProof",
                            "type": "bytes32[]",
                            "internalType": "bytes32[]"
                        },
                        {
                            "name": "data",
                            "type": "tuple",
                            "internalType": "struct IJsonApi.Response",
                            "components": [
                                {
                                    "name": "attestationType",
                                    "type": "bytes32",
                                    "internalType": "bytes32"
                                },
                                {
                                    "name": "sourceId",
                                    "type": "bytes32",
                                    "internalType": "bytes32"
                                },
                                {
                                    "name": "votingRound",
                                    "type": "uint64",
                                    "internalType": "uint64"
                                },
                                {
                                    "name": "lowestUsedTimestamp",
                                    "type": "uint64",
                                    "internalType": "uint64"
                                },
                                {
                                    "name": "requestBody",
                                    "type": "tuple",
                                    "internalType": "struct IJsonApi.RequestBody",
                                    "components": [
                                        {
                                            "name": "url",
                                            "type": "string",
                                            "internalType": "string"
                                        },
                                        {
                                            "name": "postprocessJq",
                                            "type": "string",
                                            "internalType": "string"
                                        },
                                        {
                                            "name": "abi_signature",
                                            "type": "string",
                                            "internalType": "string"
                                        }
                                    ]
                                },
                                {
                                    "name": "responseBody",
                                    "type": "tuple",
                                    "internalType": "struct IJsonApi.ResponseBody",
                                    "components": [
                                        {
                                            "name": "abi_encoded_data",
                                            "type": "bytes",
                                            "internalType": "bytes"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "id",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "userInsuranceList",
            "inputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "id",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "expiryTimestamp",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "event",
            "name": "ClaimPaid",
            "inputs": [
                {
                    "name": "id",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "receiver",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "payout",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "NewInsurance",
            "inputs": [
                {
                    "name": "id",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "PremiumPaid",
            "inputs": [
                {
                    "name": "id",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "payer",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        }
    ],
    address: "0xba9c10e03a453332716bf2065473669db2e77437",
    chain: flareTestnet,
});

export function ThirdwebButton() {
    return (
        <ConnectButton
            client={thirdwebClient}
            chain={defineChain({
                id: 114,
                rpc: "https://coston2-api.flare.network/ext/C/rpc"
            })}
        />
    );
}