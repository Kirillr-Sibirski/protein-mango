import { Coords } from "./Coords";
import {
    Field,
    Mina,
    PrivateKey,
    AccountUpdate
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
});
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

// TODO: Input desired insured coords and radius
zkAppInstance.initialize(Field(0n), Field(0n), Field(100n));

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

// TODO: Input EVM receiver
zkAppInstance.verifyCoords(Field(0n), Field(0n), Field("0x00"));