"use server";

import { AccountUpdate, Field, Mina, PrivateKey, PublicKey } from "o1js";
import { Coords } from "../../../zkapp/src/Coords.js";

const minaNetwork = Mina.Network({
    mina: 'https://api.minascan.io/node/devnet/v1/graphql',
    archive: 'https://api.minascan.io/archive/devnet/v1/graphql',
});
Mina.setActiveInstance(minaNetwork);

const devPrivateKey = PrivateKey.fromBase58(process.env.MINA_DEV_PRIVATE_KEY);
const devAddress = devPrivateKey.toPublicKey();

export async function deployCoords( // Called when the insurer creates a new insurance contract
    x: bigint,
    y: bigint, 
    radius: bigint
): Promise<string | undefined> {
    try {
        const zkAppPrivateKey = PrivateKey.random();
        const zkAppInstance = new Coords(zkAppPrivateKey.toPublicKey());

        const deployTxn = await Mina.transaction({
            sender: devAddress,
            fee: 0.1 * (10 ** 9),
        }, async () => {
            AccountUpdate.fundNewAccount(devAddress);
            await Coords.compile();
            await zkAppInstance.deploy();
            await zkAppInstance.initialize(Field(x), Field(y), Field(radius));
        });
        await deployTxn.prove();
        const result = await deployTxn.sign([devPrivateKey, zkAppPrivateKey]).send();
        await result.safeWait();

        return zkAppInstance.address.toBase58();
    } catch (error) {
        console.error(error);
    }

    return undefined;
}

export async function verifyCoords( // Called when the claimant makes a claim
    appAddress: string, 
    x: bigint, 
    y: bigint, 
    account: string
): Promise<string | undefined> {
    try {
        const zkAppInstance = new Coords(PublicKey.fromBase58(appAddress));

        const verifyTxn = await Mina.transaction({
            sender: devAddress,
            fee: 0.1 * (10 ** 9),
        }, async () => {
            await zkAppInstance.verifyCoords(
                Field(x),
                Field(y),
                Field(account)
            );
        });
        await verifyTxn.prove();
        const result = await verifyTxn.sign([devPrivateKey]).send();
        await result.safeWait();

        return result.hash;
    } catch (error) {
        console.error(error);
    }

    return undefined;
}