# @refactor-labs/squallet-client

This is a Browser + Node squallet protocol implementation.

This know how to talk to the lit action squallet, sign transactions, sign messages, etc.


## Test

Setup your `.env` file with 

```
LIT_PRIVATE_KEY=<private key with lit token and goerli eth>

IPFS_PROJECT_ID=<infura ipfs project id>
IPFS_PROJECT_SECRET=<infura ipfs project secret>

INFURA_KEY=<infura project key>

```

Get some lit tokens
`https://faucet.litprotocol.com/`

Also load your wallet address with `goerli` testnet tokens

`yarn run test-integration` to execute integration tests