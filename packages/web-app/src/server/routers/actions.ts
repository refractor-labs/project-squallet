import { procedure, router } from '../trpc'
import { z } from 'zod'
import { ethers } from 'ethers'
import { LitContracts } from '@lit-protocol/contracts-sdk'
import base58 from 'bs58'

const fromHexString = (hexString: string) =>
  Uint8Array.from((hexString.match(/.{1,2}/g) as any).map((byte: string) => parseInt(byte, 16)))

const hexToString = (hex: string): string => {
  const hashStr = base58.encode(fromHexString(hex.slice(2)))
  return hashStr
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
      //
      const provider = new ethers.providers.JsonRpcProvider(
        'https://chain-rpc.litprotocol.com/http',
        175177
      )
      const signer = new ethers.Wallet(process.env.LIT_PRIVATE_KEY as string, provider)
      const litContracts = new LitContracts({ signer })
      await litContracts.connect()
      const publicKeyPromise = litContracts.pkpNftContract.read.getPubkey(input.pkpId)

      const ownerPromise = await litContracts.pkpNftContract.read.ownerOf(input.pkpId)
      const permittedActionsPromise =
        litContracts.pkpPermissionsContractUtil.read.getPermittedActions(input.pkpId)

      const [publicKey, owner, permittedActions] = await Promise.all([
        publicKeyPromise,
        ownerPromise,
        permittedActionsPromise
      ])

      const addressPkp = ethers.utils.computeAddress(publicKey)
      return {
        pkpId: input.pkpId,
        pkpPublicKey: publicKey,
        pkpAddress: addressPkp,
        owner,
        permittedActions: permittedActions.map(a => ({
          id: a,
          cid: hexToString(a)
        }))
      }
    }
  )
export const actionsRouter = router({
  restorePkp: restorePkp
})
