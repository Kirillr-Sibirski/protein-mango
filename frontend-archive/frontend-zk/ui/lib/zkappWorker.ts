import * as Comlink from "comlink";
import { deployCoords, verifyCoords } from './mina';

export const api = {
    async deployCoords(x: bigint, y: bigint, radius: bigint) {
        return await deployCoords(x, y, radius);
    },
    async verifyCoords(appAddress: string, x: bigint, y: bigint, account: string) {
        return await verifyCoords(appAddress, x, y, account);
    },
};

// Expose the API to be used by the main thread
Comlink.expose(api);