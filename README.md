# Transactions/Contracts
- zkApp on Mina: https://minascan.io/devnet/account/B62qkagx7KukGoYbSzXpAXZoaGMGhtGirU1TERGNjoQsQHns4rJvQYG/zk-txs
- Insurance contract on Flare: https://coston2-explorer.flare.network/address/0x345D747ad0556FB930A289eb0b1BA54eC4e0c428?tab=txs
- Premium paid: https://coston2-explorer.flare.network/tx/0x4464e64fa4a3828d20f4a48eadcb43868509e7ed8471c46e3db9b5a9ca7715a6

# Background
Traditional insurance has several limitations:
- Claiming on insurances are often long and laborious processes.
- There is a lack of transparency of what determins the premium.
- Not everyone can be an insurance provider

With Protein-Mango, all of this will change. 

# How Protein-Mango works

Protein-Mango offers a market-place for insurance against property damage caused by earthquakes. An individual with capital can make an offer to insure homeowners within a certain geographical area. The insurer includes what the premium will be, and how big the payout should be if an earthquake occurs. 

Homeowners can view the offers of insurance in their area, and start paying the premium. Each premium payment gives the homeowner 30 days of insurance.

If an earthquake occurs, the homeowner can make a claim. Protein-Mango verifies that an earthquake did indeed occur and that the claimant is insured for the area, all with external data sources. The payout is made immediately, so the claimant can focus on rebuilding, instead of length insurance claims.

# How Protein-Mango works under the hood.

When an insurer makes an offer, it is committed to our Flare contract and stored in an array. It is this array that is used to populate the insurance offers listed on the webpage. A zk proof of the coordinates of the insurance area is also submitted to our contract on the Mina chain. 

A homeowner can at any time take an offer of insurance. When they do, the location of their property be proven to be in the area of the insurance area using zk proofs. This changes the state of the Mina contract to reflect that the homeowners EVM address is tied to the insured area. 

The premium which is paid by the homeowner is sent to our Flare contract, but is immediately transferred on to the insurer. 

If an earthquake occurs, the homeowner can go to our website and start a claim. This triggers our front-end to create an attestation request in the Flare chain to query an api that provides earth quake data. The api returns the coordinates of any earthquakes and their magnitude. Another attestation request is also made to the Mina chain rpc to check if the claimant was insured for the relevant area. If both conditions are true, and the earthquake was within the insured area, the Flare contract releases the payout from the escrow an pay the claimant.

# About developing on Flare
Overall we've had a very good experience developing on the Flare chain. The docs were generally very good. There were are some examples that were very good. We used the hardhat StarWars example very much. A suggestion for the future is to include an example of where the attestation preparation and submission is done in a webapp, since this is a good use case. During ETHOxford25 it was very helpful that the team was present all day and willing to help.

# Foundry

### Deployment 
```
forge script "script/DeployInsurance.s.sol" --private-key $PRIVATE_KEY --rpc-url $COSTON2_RPC_URL --broadcast
```
### Verify
```
forge verify-contract \  --rpc-url https://coston2-api.flare.network/ext/C/rpc \
  --verifier blockscout \
  --verifier-url 'https://coston2-explorer.flare.network/api/' \
  0x345D747ad0556FB930A289eb0b1BA54eC4e0c428 \
  src/Insurance.sol:InsuranceEscrow
```
