import { Coords } from "./Coords.js";
import {
    Field,
    Mina,
    PrivateKey,
    AccountUpdate,
    UInt32,
} from "o1js";

const useProof = false;
const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);

const deployerAccount = Local.testAccounts[0];
const deployerKey = deployerAccount.key;
const senderAccount = Local.testAccounts[1];
const senderKey = senderAccount.key;

const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

const zkAppInstance = new Coords(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, async () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    await zkAppInstance.deploy();

    // TODO: Input insured coords and radius
    await zkAppInstance.initialize(Field(0n), Field(0n), Field(100n));
});
await deployTxn.prove();
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

const verifyTxn = await Mina.transaction(senderAccount, async () => {
    await zkAppInstance.verifyCoords(
        Field(0n),
        Field(0n),
        Field("0x00")
    );
});
await verifyTxn.prove();
await verifyTxn.sign([senderKey]).send();

/*
const Network = Mina.Network({
    mina: 'https://api.minascan.io/node/devnet/v1/graphql',
    archive: 'https://api.minascan.io/archive/devnet/v1/graphql',
});
Mina.setActiveInstance(Network);
*/

const events = await zkAppInstance.fetchEvents(UInt32.from(0));

const account: string = '0x' + BigInt(events[0].event.data.toString()).toString(16);
console.log(account);

/*
const getPosition = async () => {
    const position: GeolocationPosition | undefined | null = await new Promise(
        (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        }
    );
    if (!position) {
        return undefined;
    }

    return {
        x: BigInt(position.coords.longitude * (10 ** 5)),
        y: BigInt(position.coords.latitude * (10 ** 5)),
    };
};

const position = await getPosition();
if (!position) {
    throw ("Geolocation error!");
}
*/