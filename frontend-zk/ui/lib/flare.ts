export async function prepareCoordsFdcRequest() {
    
}

export async function prepareDisasterFdcRequest() {
    
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
                "X-API-KEY": "flare-oxford-2025"
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
            return;
        }

        const data = await response.json();
        if (data?.status !== "VALID") {
            return;
        }

        return data?.abiEncodedRequest;
    } catch (error) {
        console.error(error);
    }

    return undefined;
}