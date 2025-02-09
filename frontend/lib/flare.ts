import { toHex } from "./utils";

export async function prepareCoordsFdcRequest(appAddress: string, account: string): Promise<string | undefined> {
    // DEBUG: B62qkMsDFM5gkQwRsDqsup48f78VpCM4Ra5m9gYQMxm63UH5eXG8g6f
    // DEBUG: 0x000000000000000000000000000000000000dead
    return await prepareFdcRequest(
        toHex("IJsonApi"),
        toHex("WEB2"),
        `https://api.minascan.io/archive/devnet/v1/graphql?query={ events(input: { address: "${appAddress}" }) { eventData { data } } }`,
        `{
            account: (if ([.data.events[]? | select((.eventData[0]?.data // "") == "${BigInt(account).toString()}")] | length) > 0 
                then "${account}" 
                else "0x0000000000000000000000000000000000000000" 
                end
            )
        }`,
        `{
            "components": [
                {"internalType": "address", "name": "account", "type": "address"}
            ],
            "name": "task",
            "type": "tuple"
        }`
    );
}

export async function prepareDisasterFdcRequest(): Promise<string | undefined> {
    return await prepareFdcRequest(
        toHex("IJsonApi"),
        toHex("WEB2"),
        "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=37.7749&longitude=-122.4194&maxradiuskm=50&starttime=2024-01-01&endtime=2024-01-03",
        `{
            time: (.features[0]?.properties?.time // 0),
            mag: (.features[0]?.properties?.mag // 0 * 10000 | floor),
            longitude: (.features[0]?.geometry?.coordinates[0] // 0 * 1000000000 | floor),
            latitude: (.features[0]?.geometry?.coordinates[1] // 0 * 1000000000 | floor)
        }`,
        `{
            \"components\": [
                {\"internalType\": \"uint256\",\"name\": \"time\",\"type\": \"uint256\"},
                {\"internalType\": \"uint256\",\"name\": \"mag\",\"type\": \"uint256\"},
                {\"internalType\": \"int256\",\"name\": \"longitude\",\"type\": \"int256\"},
                {\"internalType\": \"int256\",\"name\": \"latitude\",\"type\": \"int256\"}
            ],
            \"name\": \"task\",
            \"type\": \"tuple\"
        }`
    );
}

async function prepareFdcRequest(
    attestationType: string,
    sourceId: string,
    url: string,
    postprocessJq: string,
    abiSignature: string
): Promise<string | undefined> {
    try {
        const response = await fetch("https://jq-verifier-test.flare.rocks/JsonApi/prepareRequest", {
            method: "POST",
            headers: {
                "X-API-KEY": "flare-oxford-2025",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "attestationType": attestationType,
                "sourceId": sourceId,
                "requestBody": {
                    "url": url,
                    "postprocessJq": postprocessJq,
                    "abi_signature": abiSignature
                }
            })
        });
        if (!response.ok) {
            throw (response.status);
        }

        const data = await response.json();
        if (data?.status !== "VALID") {
            throw ("500");
        }

        return data?.abiEncodedRequest;
    } catch (error) {
        console.error(error);
    }

    return undefined;
}