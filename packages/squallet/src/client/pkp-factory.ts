import { Signer } from "@ethersproject/abstract-signer";
import { Wallet } from "@ethersproject/wallet";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { restorePkpInfo } from "./restore";

interface IPFSUploader {
  (data: string): Promise<{ cid: string }>;
}
export const factoryCreatePkp = async ({
  signer,
  ipfs,
  code,
}: {
  // owners: string[];
  // threshold: number;
  code: string;
  signer: Wallet;
  ipfs: IPFSUploader;
}) => {
  // if (owners.length < threshold) {
  //   throw new Error("threshold must be less than or equal to owners.length");
  // }

  const ipfsCid = await ipfs(code);
  const newCid = ipfsCid.cid;

  const litContracts = new LitContracts({ signer });
  console.log("litContracts", litContracts);
  await litContracts.connect();
  const mintCost = await litContracts.pkpNftContract.read.mintCost();
  // console.log("mintCost", mintCost);
  const tx = await litContracts.pkpNftContract.write.mintNext(2, {
    value: mintCost,
  });
  // console.log("tx", tx);
  const txResp = await tx.wait();
  // console.log("txResp", txResp);
  const transferEvent = txResp.events.find((e: any) => e.event === "Transfer");
  const pkpId = transferEvent?.topics[3];

  const signerAddress = await litContracts.signer.getAddress();
  const { chainId } = await litContracts.provider.getNetwork();

  const pkp = await restorePkpInfo(pkpId.toString());
  const { pkpAddress } = pkp;

  await litContracts.pkpPermissionsContractUtil.write.addPermittedAction(
    pkpId,
    newCid
  );
  try {
    const transferTx = await litContracts.pkpNftContract.write.transferFrom(
      signerAddress,
      pkpAddress,
      pkpId
    );
    await transferTx.wait();
  } catch (e) {
    console.log("transferTx error", e);
    throw e;
  }

  return { ...pkp, cid: newCid.toString() };
};
