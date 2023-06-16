import { ethers } from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import base58 from "bs58";

export const getChronicleProvider = () => {
  return new ethers.providers.JsonRpcProvider(
    "https://chain-rpc.litprotocol.com/http",
    175177
  );
};

export const restorePkpInfo = async (pkpId: string) => {
  const provider = getChronicleProvider();
  const litContracts = new LitContracts({ provider });
  await litContracts.connect();
  const publicKeyPromise = litContracts.pkpNftContract.read.getPubkey(pkpId);

  const ownerPromise = litContracts.pkpNftContract.read.ownerOf(pkpId);
  const permittedActionsPromise =
    litContracts.pkpPermissionsContractUtil.read.getPermittedActions(pkpId);

  const [publicKey, owner, permittedActions] = await Promise.all([
    publicKeyPromise,
    ownerPromise,
    permittedActionsPromise,
  ]);

  const addressPkp = ethers.utils.computeAddress(publicKey);
  return {
    pkpId: pkpId,
    pkpPublicKey: publicKey,
    pkpAddress: addressPkp,
    owner,
    permittedActions: permittedActions.map((a) => ({
      id: a,
      cid: hexToString(a),
    })),
  };
};
const hexToString = (hex: string): string => {
  const hashStr = base58.encode(fromHexString(hex.slice(2)));
  return hashStr;
};

const fromHexString = (hexString: string) =>
  Uint8Array.from(
    (hexString.match(/.{1,2}/g) as any).map((byte: string) =>
      parseInt(byte, 16)
    )
  );
