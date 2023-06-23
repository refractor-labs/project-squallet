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
      const createNew = true
      const fund = true

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
          pkpId: '0x28736ccf83fbc0376fdfddfa96364232d8832a841a01455c1c452ebb6a78e953',
          pkpPublicKey:
            '0x0424bdd6817be95993c4100f5d51f6535e002a9a5abed52543d343eb5b9cd3709208521860c7e0e0bb0a9cf2345f7722214f0889039fa6e3cbeb889d0e3ea14f8e',
          pkpAddress: '0xD2745FA34C730404c0BDfb7211912e10770C0DD9',
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
      const request: SignTransactionRequest = {
        method: 'signTransaction',
        request: {
          fee: {
            maxFeePerGas: maxFeePerGas.mul(2).toString(),
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
  })
})
