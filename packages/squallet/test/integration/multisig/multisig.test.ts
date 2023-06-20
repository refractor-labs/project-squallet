import { getLitActionCode, ipfsWrapper } from "../../utils";
import { resolve } from "path";
import {
  factoryCreatePkp,
  getChronicleProvider,
  getInfuraProvider,
  SignTransactionRequest,
  SqualletWalletBrowserClient,
} from "../../../src";
import { ethers } from "ethers";
import {
  hashUnsignedTransaction,
  TransactionRequestI,
} from "@refactor-labs-lit-protocol/litlib";

const mumbaiChainId = 80001;
describe("MultiSig", () => {
  describe("Data", () => {
    //setup vars
    beforeEach(async () => {
      //setupo
    });
    it("should test", async () => {
      const signer = new ethers.Wallet(
        process.env.LIT_PRIVATE_KEY as string,
        getChronicleProvider()
      );

      let code = await getLitActionCode(
        resolve("../../packages/lit-actions/dist/multisig.action.js")
      );
      if (!code) {
        return expect(code).toBeDefined();
      }
      code = code.replace("var threshold = 1337;", "var threshold = 1;");
      code = code.replace('"%%OWNER_ADDRESS%%"', `"${signer.address}"`);

      const createNew = false;
      const fund = false;

      let pkpPromise: ReturnType<typeof factoryCreatePkp>;
      if (createNew) {
        pkpPromise = factoryCreatePkp({ signer, ipfs: ipfsWrapper, code });
      } else {
        pkpPromise = Promise.resolve({
          pkpId:
            "0x161539e28a43a0545c74de4f0177a7c832cbafcc57ebd3951d3613ff327c0796",
          pkpPublicKey:
            "0x04c02bf0d1c2becec9efdce670621f6723c4b7837c328797647a407300ec1beab87ad20134ba106843f1b74fbabaef53eaf16562ee0f03a9825ae1ec04f03e4280",
          pkpAddress: "0x775Db4ce837a1FbB47A0E423E4cA3cA63B3Ed1EB",
          owner: "0x182351E16c1F511e50eA4438aFE3d0f16ae4769B",
          permittedActions: [],
          cid: "QmZ88D2h6392tZSM4kPFydTE3SqZayH5RnSmdFrsbnALXf",
        });
      }
      const pkp = await pkpPromise;
      //
      //create a pkp here

      console.log("pkp", JSON.stringify(pkp, null, 2));
      const providerMumbai = getInfuraProvider(mumbaiChainId);
      const signerMumbai = new ethers.Wallet(
        process.env.LIT_PRIVATE_KEY as string,
        providerMumbai
      );
      if (fund) {
        await signerMumbai.sendTransaction({
          to: pkp.pkpAddress,
          value: ethers.utils.parseEther("0.001"),
        });
        console.log("funded");
      }
      const client = new SqualletWalletBrowserClient(
        pkp,
        signerMumbai,
        mumbaiChainId,
        pkp.cid
      );
      const fee = await providerMumbai.getFeeData();
      const estimate = await providerMumbai.estimateGas({
        to: pkp.pkpAddress,
        from: pkp.pkpAddress,
        value: "0x0",
      });

      const { maxFeePerGas, maxPriorityFeePerGas } = fee;
      if (!maxFeePerGas || !maxPriorityFeePerGas) {
        throw new Error("no fee");
      }
      const tx: TransactionRequestI = {
        to: pkp.pkpAddress,
        from: signer.address,
        nonce: 0,
        gasLimit: estimate,
        gasPrice: undefined,
        data: "0x",
        value: "0x0",
        chainId: mumbaiChainId,
        type: 2,
        maxPriorityFeePerGas: maxPriorityFeePerGas,
        maxFeePerGas: maxFeePerGas,
      };
      const hash = hashUnsignedTransaction(tx);
      const request: SignTransactionRequest = {
        method: "signTransaction",
        request: {
          transaction: tx,
          signedTransaction: {
            walletAddress: pkp.pkpAddress,
            hash,
            signatures: [
              {
                signerAddress: signerMumbai.address,
                signature: await signerMumbai.signMessage(hash),
              },
            ],
            transaction: tx,
          },
        },
      };
      const res = await client.sendRequest(request);

      console.log("res", res);
      //todo test
      // expect(dataOutCompressed.length).toEqual(dataOut.length);
    });
  });
});
