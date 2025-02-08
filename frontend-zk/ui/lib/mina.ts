import { AccountUpdate, Field, Mina, PrivateKey, PublicKey } from "o1js";
import { Coords } from "../../../zkapp/build/src/Coords.js";

const minaNetwork = Mina.Network({
    mina: 'https://api.minascan.io/node/devnet/v1/graphql',
    archive: 'https://api.minascan.io/archive/devnet/v1/graphql',
});
Mina.setActiveInstance(minaNetwork);

// TODO: Read from env
const devPrivateKey = PrivateKey.random();
const devAddress = devPrivateKey.toPublicKey();

export async function deployCoords(
    x: bigint,
    y: bigint, 
    radius: bigint
): Promise<string | undefined> {
    try {
        const zkAppPrivateKey = PrivateKey.random();
        const zkAppInstance = new Coords(zkAppPrivateKey.toPublicKey());

        const deployTxn = await Mina.transaction(devAddress, async () => {
            AccountUpdate.fundNewAccount(devAddress);
            await zkAppInstance.deploy();
            await zkAppInstance.initialize(Field(x), Field(y), Field(radius));
        });
        await deployTxn.prove();
        await deployTxn.sign([devPrivateKey, zkAppPrivateKey]).send();

        return "CONTRACT_ADDRESS";
    } catch (error) {
        console.error(error);
    }

    return undefined;
}

export async function verifyCoords(
    appAddress: string, 
    x: bigint, 
    y: bigint, 
    account: string
): Promise<boolean> {
    try {
        const zkAppInstance = new Coords(PublicKey.fromBase58(appAddress));

        const verifyTxn = await Mina.transaction(devAddress, async () => {
            await zkAppInstance.verifyCoords(
                Field(x),
                Field(y),
                Field(account)
            );
        });
        await verifyTxn.prove();
        await verifyTxn.sign([devPrivateKey]).send();

        return true;
    } catch (error) {
        console.error(error);
    }

    return false;
}