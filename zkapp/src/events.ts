import { Field, Mina, Provable, ProvablePure, PublicKey, UInt32 } from "o1js";
import { Coords } from "./Coords";

const Network = Mina.Network({
    mina: 'https://api.minascan.io/node/devnet/v1/graphql',
    archive: 'https://api.minascan.io/archive/devnet/v1/graphql',
});
Mina.setActiveInstance(Network);

const zkapp = new Coords(new PublicKey());
const events = await zkapp.fetchEvents(UInt32.from(0));