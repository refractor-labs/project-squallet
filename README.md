`yarn dev`


### Build lit action
`yarn build-lit`

this will bundle `src/actions-source/multisig.js` and put it into `webpack/dist/lit-action-bundle.js`. You can then take that and copy it into `src/components/lit-actions-code.js`  multisig action as a string.


### signTransction on dapp
Open `localhost:3000/wallet`
open https://react-dapp-v2-with-ethers.vercel.app/
connect via the wc url
click on eth_signTransaction
approve it.
sign it with your eoa wallet
watch the logs, it will be approved by the lit action and return a signature

next up: actually have the dapp correctly verify the signed transaction
I think the chain id is incorrect
Sort out the gas parameters!
