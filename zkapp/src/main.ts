import { Location } from "./Location";
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

const zkAppInstance = new Location(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, async () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    await zkAppInstance.deploy();
});
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

// TODO: Input desired insured coords and radius
zkAppInstance.initLocation(Field(0n), Field(0n), Field(100n));

// TODO: Input EVM receiver
zkAppInstance.verifyReceiver(Field("0x00"));