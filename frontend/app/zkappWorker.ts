import * as Comlink from "comlink";
import { deployCoords, verifyCoords } from '../lib/mina';
import { AccountUpdate, Field, Mina, PrivateKey, PublicKey } from "o1js";
import { Coords } from "../../zkapp/build/src/Coords.js";

const network = Mina.Network({
    mina: 'https://api.minascan.io/node/devnet/v1/graphql',
    archive: 'https://api.minascan.io/archive/devnet/v1/graphql',
});
Mina.setActiveInstance(network);

export const api = {
    async deployCoords(x: bigint, y: bigint, radius: bigint) {
        const zkAppPrivateKey = PrivateKey.random();
        const zkAppInstance = new Coords(zkAppPrivateKey.toPublicKey());

        await Coords.compile();

        const deployTxn = await Mina.transaction({
            sender: PublicKey.fromBase58("B62qkagx7KukGoYbSzXpAXZoaGMGhtGirU1TERGNjoQsQHns4rJvQYG"),
            fee: 0.1 * (10 ** 9),
        }, async () => {
            AccountUpdate.fundNewAccount(PublicKey.fromBase58("B62qkagx7KukGoYbSzXpAXZoaGMGhtGirU1TERGNjoQsQHns4rJvQYG"));
            await zkAppInstance.deploy();
            await zkAppInstance.initialize(Field(x), Field(y), Field(radius));
        });
        await deployTxn.prove();
        const result = await deployTxn.sign([PrivateKey.fromBase58("EKE8NcPy7gH3zV9iGSTetT47UeXJKB3QBHXJTh2wHeHPuvDqUjEG"), zkAppPrivateKey]).send();
        await result.safeWait();
    },
    async verifyCoords(appAddress: string, x: bigint, y: bigint, account: string) {
        return await verifyCoords(appAddress, x, y, account);
    },
};

// Expose the API to be used by the main thread
Comlink.expose(api);