export async function prepareFdcRequest(): Promise<string | undefined> {
    try {
        //https://jq-verifier-test.flare.rocks/
        const response = await fetch("https://jq-verifier-test.flare.rocks/JsonApi/prepareRequest", {
            method: "POST",
            headers: {
                "X-API-KEY": "flare-oxford-2025"
            },
            body: JSON.stringify({
                "attestationType": "0x494a736f6e417069000000000000000000000000000000000000000000000000",
                "sourceId": "0x5745423200000000000000000000000000000000000000000000000000000000",
                "requestBody": {
                    "url": "https://jsonplaceholder.typicode.com/todos/1",
                    "postprocessJq": ".",
                    "abi_signature": "{\"components\": [{\"internalType\": \"uint8\",\"name\": \"userId\",\"type\": \"uint8\"},{\"internalType\": \"uint8\",\"name\": \"id\",\"type\": \"uint8\"},{\"internalType\": \"string\",\"name\": \"title\",\"type\": \"string\"},{\"internalType\": \"bool\",\"name\": \"completed\",\"type\": \"bool\"}],\"name\": \"task\",\"type\": \"tuple\"}"
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