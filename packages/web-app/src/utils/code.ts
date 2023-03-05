import { gnosis } from "@/abis/gnosis";

export const getCode = (address: string) => `
const go = async () => {  
  const abi = ${JSON.stringify(gnosis.abi)};

  const serialized = ethers.utils.serializeTransaction(tx)
  const hash = ethers.utils.keccak256(serialized)

  const provider = new ethers.providers.JsonRpcProvider(rpc, network);
  const contract = new ethers.Contract("${address}" , abi , provider);
  const signers = await contract.getOwners();

  const isMatch = async (address, signature) =>{
    try {
      const signerAddr = await ethers.utils.verifyMessage(hash, signature);
      if (signerAddr.toLocaleLowerCase() === address.toLocaleLowerCase()) {
        return true;
      }
    } catch (err) {
    }
    return false;
  }

  let matchedSignatures = [];
  for (let i=0; i<signers.length; i++) {
    const signer = signers[i];
    for (let j=0; j<signatures.length; j++) {
      const signature = signatures[j];
      if (matchedSignatures.indexOf(signature) !== -1) {
        continue
      }
      if (await isMatch(signer, signature)) {
        matchedSignatures.push(signature);
        break;
      }
    }
  }
  
  if (matchedSignatures.length < threshhold) {
    return
  }

  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  // all the params (tx, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
  const sigShare = await Lit.Actions.signEcdsa({ 
    toSign: ethers.utils.arrayify(hash), 
    publicKey, 
    sigName 
  });
};

go();`  
