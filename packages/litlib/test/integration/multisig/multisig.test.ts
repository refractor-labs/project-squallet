import { getLitActionCode, ipfsWrapper } from "../../utils";
import { resolve } from "path";
import {
  factoryCreatePkp,
  getChronicleProvider,
  SqualletWalletBrowserClient,
} from "../../../src";
import { ethers } from "ethers";

describe("MultiSig", () => {
  describe("Data", () => {
    //setup vars
    beforeEach(async () => {
      //setupo
    });
    it("should test", async () => {
      const code = await getLitActionCode(
        resolve("../../packages/lit-actions/dist/multisig.action.js")
      );

      if (!code) {
        return expect(code).toBeDefined();
      }

      const signer = new ethers.Wallet(
        process.env.LIT_PRIVATE_KEY as string,
        getChronicleProvider()
      );

      const pkp = await factoryCreatePkp({ signer, ipfs: ipfsWrapper, code });
      //create a pkp here
      const client = new SqualletWalletBrowserClient(pkp, signer, 1, pkp.cid);

      //todo test
      // expect(dataOutCompressed.length).toEqual(dataOut.length);
    });
  });
});
