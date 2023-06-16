import { procedure, router } from '../trpc'
import { z } from 'zod'
import { ethers } from 'ethers'
import { LitContracts } from '@lit-protocol/contracts-sdk'
import base58 from 'bs58'
import { TRPCError } from '@trpc/server'
import { ipfs } from '@/utils/ipfs'
import { getCode, getCodeV2 } from '@/utils/code'
import { factoryCreatePkp, getChronicleProvider } from '@refactor-labs-lit-protocol/litlib'

const fromHexString = (hexString: string) =>
  Uint8Array.from((hexString.match(/.{1,2}/g) as any).map((byte: string) => parseInt(byte, 16)))

const hexToString = (hex: string): string => {
  const hashStr = base58.encode(fromHexString(hex.slice(2)))
  return hashStr
}

const restorePkpInfo = async (pkpId: string) => {
  const provider = new ethers.providers.JsonRpcProvider(
    'https://chain-rpc.litprotocol.com/http',
    175177
  )
  // const signer = new ethers.Wallet(process.env.LIT_PRIVATE_KEY as string, provider)
  const litContracts = new LitContracts({ provider })
  await litContracts.connect()
  const publicKeyPromise = litContracts.pkpNftContract.read.getPubkey(pkpId)

  const ownerPromise = litContracts.pkpNftContract.read.ownerOf(pkpId)
  const permittedActionsPromise =
    litContracts.pkpPermissionsContractUtil.read.getPermittedActions(pkpId)

  const [publicKey, owner, permittedActions] = await Promise.all([
    publicKeyPromise,
    ownerPromise,
    permittedActionsPromise
  ])

  const addressPkp = ethers.utils.computeAddress(publicKey)
  return {
    pkpId: pkpId,
    pkpPublicKey: publicKey,
    pkpAddress: addressPkp,
    owner,
    permittedActions: permittedActions.map(a => ({
      id: a,
      cid: hexToString(a)
    }))
  }
}
const restorePkp = procedure
  .input(
    z.object({
      pkpId: z.string()
    })
  )
  .query(
    async ({
      input
    }): Promise<{
      pkpId: string
      pkpPublicKey: string
      pkpAddress: string
      owner: string
      permittedActions: { id: string; cid: string }[]
    }> => {
      return restorePkpInfo(input.pkpId)
    }
  )

const createPkp = procedure
  .input(
    z.object({
      owners: z.array(z.string()),
      threshold: z.number().int().positive()
    })
  )
  .mutation(async ({ input }) => {
    if (input.owners.length < input.threshold) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'threshold must be less than or equal to owners.length'
      })
    }
    const provider = getChronicleProvider()

    const signer = new ethers.Wallet(process.env.LIT_PRIVATE_KEY as string, provider)

    const code = getCodeV2(input.owners, input.threshold)
    const ipfsWrapper = async (code: string) => {
      const ipfsResp = await ipfs.add(getCodeV2(input.owners, input.threshold))
      return { cid: ipfsResp.cid.toString() }
    }
    const pkp = await factoryCreatePkp({ signer, code, ipfs: ipfsWrapper })
    // // const litContracts = new LitContracts({ signer })
    // // await litContracts.connect()
    // //
    // // // mint token
    // // const mintCost = await litContracts.pkpNftContract.read.mintCost()
    // // console.log('mintCost', mintCost)
    // // const tx = await litContracts.pkpNftContract.write.mintNext(2, { value: mintCost })
    // // console.log('tx', tx)
    // // const txResp = await tx.wait()
    // // console.log('txResp', txResp)
    // //
    // // const transferEvent = txResp.events.find((e: any) => e.event === 'Transfer')
    // // const pkpId = transferEvent?.topics[3]
    // //
    // // const ipfsResp = await ipfs.add(getCodeV2(input.owners, input.threshold))
    // // const newCid = ipfsResp.cid
    // // const signerAddress = await litContracts.signer.getAddress()
    // // const { chainId } = await litContracts.provider.getNetwork()
    // //
    // // const pkp = await restorePkpInfo(pkpId.toString())
    // // const { pkpAddress } = pkp
    //
    // await litContracts.pkpPermissionsContractUtil.write.addPermittedAction(pkpId, newCid.toString())
    // try {
    //   const transferTx = await litContracts.pkpNftContract.write.transferFrom(
    //     signerAddress,
    //     pkpAddress,
    //     pkpId
    //   )
    //   await transferTx.wait()
    // } catch (e) {
    //   console.log('transferTx error', e)
    //   throw e
    // }

    return pkp
  })

export const actionsRouter = router({
  restorePkp: restorePkp,
  createPkp: createPkp
})
