import { Coords } from "./Coords.js";
import {
    Field,
    Mina,
    PrivateKey,
    AccountUpdate,
    UInt32,
    PublicKey,
    fetchAccount,
    fetchEvents,
} from "o1js";

/*
const useProof = false;
const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
*/

const Network = Mina.Network({
    mina: 'https://api.minascan.io/node/devnet/v1/graphql',
    archive: 'https://api.minascan.io/archive/devnet/v1/graphql',
});
Mina.setActiveInstance(Network);

const x = await fetchEvents({
    publicKey: "B62qkMsDFM5gkQwRsDqsup48f78VpCM4Ra5m9gYQMxm63UH5eXG8g6f"
});

/*
const deployerAccount = Local.testAccounts[0];
const deployerKey = deployerAccount.key;
const senderAccount = Local.testAccounts[1];
const senderKey = senderAccount.key;
*/

const dev = PrivateKey.fromBase58("EKE8NcPy7gH3zV9iGSTetT47UeXJKB3QBHXJTh2wHeHPuvDqUjEG")

const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();
console.log(zkAppAddress.toBase58())

const zkAppInstance = new Coords(zkAppAddress);

const deployTxn = await Mina.transaction({
    sender: dev.toPublicKey(),
    fee: 0.1 * (10 ** 9),
}, async () => {
    AccountUpdate.fundNewAccount(dev.toPublicKey());
    await Coords.compile();
    await zkAppInstance.deploy();

    // TODO: Input insured coords and radius
    await zkAppInstance.initialize(Field(0n), Field(0n), Field(100n));
});
await deployTxn.prove();
const deployResult = await deployTxn.sign([dev, zkAppPrivateKey]).send();
await deployResult.safeWait();

await fetchAccount({ publicKey: zkAppAddress });

const verifyTxn = await Mina.transaction({
    sender: dev.toPublicKey(),
    fee: 0.1 * (10 ** 9),
}, async () => {
    await zkAppInstance.verifyCoords(
        Field(0n),
        Field(0n),
        Field("0x000000000000000000000000000000000000dEaD")
    );
});
try {
    await verifyTxn.prove();
    await verifyTxn.sign([dev]).send();
    console.log('Verification transaction sent successfully.');
} catch (error) {
    console.error('Error sending verification transaction:', error);
}

const events = await zkAppInstance.fetchEvents(UInt32.from(0));
console.log(events);
console.log(events[0].event.data)

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