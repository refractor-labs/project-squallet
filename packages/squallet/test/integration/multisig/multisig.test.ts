import { ipfsWrapper } from '../../utils'
import {
  factoryCreatePkp,
  getChronicleProvider,
  getInfuraProvider,
  SignTransactionRequest,
  SqualletWalletBrowserClient
} from '../../../src'

import { hashTransactionRequest, TransactionRequestI } from '@refactor-labs-lit-protocol/litlib'
import { ethers, Wallet } from 'ethers'
import { replaceSignersInCode } from '../../../src/utils'
import { InfuraProvider } from '@ethersproject/providers'

const testnetChainId = 5
describe('MultiSig', () => {
  describe('signTransaction', () => {
    //setup vars

    let pkp: {
      pkpId: string
      pkpPublicKey: string
      pkpAddress: string
      owner: string
      permittedActions: { id: any; cid: string }[]
      cid: string
    }
    let provider: InfuraProvider
    let signer: Wallet
    let client: SqualletWalletBrowserClient

    beforeAll(async () => {
      //setup
      const createNew = false
      const fund = false

      const signerChronicle = new ethers.Wallet(
        process.env.LIT_PRIVATE_KEY as string,
        getChronicleProvider()
      )
      provider = getInfuraProvider(testnetChainId)
      signer = new ethers.Wallet(process.env.LIT_PRIVATE_KEY as string, provider)

      let code = await replaceSignersInCode([signer.address], 1)

      let pkpPromise: ReturnType<typeof factoryCreatePkp>
      if (createNew) {
        pkpPromise = factoryCreatePkp({ signer: signerChronicle, ipfs: ipfsWrapper, code })
      } else {
        pkpPromise = Promise.resolve({
          pkpId: '0x1291aae48f2e3098a368db977a338af469eebf978b6afb8c55188be6ec48bd8a',
          pkpPublicKey:
            '0x04b87dab052561080876dd2b34fd09f14d1e623e9b3c5617da28aa385f7ddca04b75d1769ea0bbbfbc24a0d9e9b3c3c3663ec2c53e9e1ec7f40e59263558313ca0',
          pkpAddress: '0xbba62e94168AF5A1Aba013fC29d88827a4Ab6A91',
          owner: '0x182351E16c1F511e50eA4438aFE3d0f16ae4769B',
          permittedActions: [],
          cid: 'QmZB93Z2ABJKPvzLaxfE55ioMt7PQnGzAphGE93g3n6q45'
        })
      }
      pkp = await pkpPromise

      console.log('pkp', JSON.stringify(pkp, null, 2))

      if (fund) {
        await signer.sendTransaction({
          to: pkp.pkpAddress,
          value: ethers.utils.parseEther('0.001')
        })
        console.log('funded')
      }

      client = new SqualletWalletBrowserClient(pkp, signer, testnetChainId, pkp.cid)
    })

    it('should sign a transaction with correct signatures', async () => {
      //
      //create a pkp here

      const fee = await provider.getFeeData()
      const estimate = await provider.estimateGas({
        to: pkp.pkpAddress,
        from: pkp.pkpAddress,
        value: '0x0'
      })

      const { maxFeePerGas, maxPriorityFeePerGas } = fee
      if (!maxFeePerGas || !maxPriorityFeePerGas) {
        throw new Error('no fee')
      }

      const maxFee = estimate.mul(maxFeePerGas).mul(7)

      const tx: TransactionRequestI = {
        to: pkp.pkpAddress,
        from: signer.address,
        nonce: 0,
        gasLimit: estimate.toString(),
        gasPrice: undefined,
        data: '0x',
        value: '0x0',
        chainId: testnetChainId,
        type: 2,
        maxPriorityFeePerGas: undefined,
        maxFeePerGas: undefined,
        maxFee: maxFee.toString()
      }
      const hash = hashTransactionRequest(tx)
      const request: SignTransactionRequest = {
        method: 'signTransaction',
        request: {
          fee: {
            maxFeePerGas: maxFeePerGas.toString(),
            maxPriorityFeePerGas: maxPriorityFeePerGas.toString()
          },
          signedTransaction: {
            walletAddress: pkp.pkpAddress,
            hash,
            signatures: [
              {
                signerAddress: ethers.utils.getAddress(signer.address),
                signature: await signer.signMessage(hash)
              }
            ],
            transaction: tx
          }
        }
      }
      const res = await client.sendRequest(request)
      console.log('res', res)
      if (!res.success) {
        expect(res.success).toBeTruthy()
      }
    })

    it('should sign a transaction with correct signatures with a higher fee', async () => {
      const fee = await provider.getFeeData()
      const estimate = await provider.estimateGas({
        to: pkp.pkpAddress,
        from: pkp.pkpAddress,
        value: '0x0'
      })

      const { maxFeePerGas, maxPriorityFeePerGas } = fee
      if (!maxFeePerGas || !maxPriorityFeePerGas) {
        throw new Error('no fee')
      }

      const maxFee = estimate.mul(maxFeePerGas).mul(7)

      const tx: TransactionRequestI = {
        to: pkp.pkpAddress,
        from: signer.address,
        nonce: 0,
        gasLimit: estimate.toString(),
        gasPrice: undefined,
        data: '0x',
        value: '0x0',
        chainId: testnetChainId,
        type: 2,
        maxPriorityFeePerGas: undefined,
        maxFeePerGas: undefined,
        maxFee: maxFee.toString()
      }
      const hash = hashTransactionRequest(tx)

      for (let i = 1; i <= 7; i++) {}

      let feeMult = [2, 7]
      for (const mult of feeMult) {
        const request: SignTransactionRequest = {
          method: 'signTransaction',
          request: {
            fee: {
              maxFeePerGas: maxFeePerGas.mul(mult).toString(),
              maxPriorityFeePerGas: maxPriorityFeePerGas.toString()
            },
            signedTransaction: {
              walletAddress: pkp.pkpAddress,
              hash,
              signatures: [
                {
                  signerAddress: ethers.utils.getAddress(signer.address),
                  signature: await signer.signMessage(hash)
                }
              ],
              transaction: tx
            }
          }
        }
        const res = await client.sendRequest(request)
        console.log(mult, 'res', res)
        if (!res.success) {
          expect(res.success).toBeTruthy()
        }
      }
    })

    it('should prevent sign a transaction with correct signatures with fee over limit', async () => {
      const fee = await provider.getFeeData()
      const estimate = await provider.estimateGas({
        to: pkp.pkpAddress,
        from: pkp.pkpAddress,
        value: '0x0'
      })

      const { maxFeePerGas, maxPriorityFeePerGas } = fee
      if (!maxFeePerGas || !maxPriorityFeePerGas) {
        throw new Error('no fee')
      }

      const maxFee = estimate.mul(maxFeePerGas).mul(7)

      const tx: TransactionRequestI = {
        to: pkp.pkpAddress,
        from: signer.address,
        nonce: 0,
        gasLimit: estimate.toString(),
        gasPrice: undefined,
        data: '0x',
        value: '0x0',
        chainId: testnetChainId,
        type: 2,
        maxPriorityFeePerGas: undefined,
        maxFeePerGas: undefined,
        maxFee: maxFee.toString()
      }
      const hash = hashTransactionRequest(tx)

      const request: SignTransactionRequest = {
        method: 'signTransaction',
        request: {
          fee: {
            maxFeePerGas: maxFeePerGas.mul(8).toString(),
            maxPriorityFeePerGas: maxPriorityFeePerGas.toString()
          },
          signedTransaction: {
            walletAddress: pkp.pkpAddress,
            hash,
            signatures: [
              {
                signerAddress: ethers.utils.getAddress(signer.address),
                signature: await signer.signMessage(hash)
              }
            ],
            transaction: tx
          }
        }
      }
      const res = await client.sendRequest(request)
      console.log('res', res)
      expect(res.success).toBe(false)
      expect(res.data).toBe('fee too high')
    })
  })
})
