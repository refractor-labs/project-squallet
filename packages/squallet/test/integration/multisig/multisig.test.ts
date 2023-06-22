import { getLitActionCode, ipfsWrapper } from '../../utils'
import { resolve } from 'path'
import {
  factoryCreatePkp,
  getChronicleProvider,
  getInfuraProvider,
  SignTransactionRequest,
  SqualletWalletBrowserClient
} from '../../../src'
import { ethers } from 'ethers'
import {
  hashTransactionRequest,
  hashUnsignedTransaction,
  TransactionRequestI
} from '@refactor-labs-lit-protocol/litlib'

const testnetChainId = 5
describe('MultiSig', () => {
  describe('Data', () => {
    //setup vars
    beforeEach(async () => {
      //setupo
    })
    it('should test', async () => {
      const signer = new ethers.Wallet(
        process.env.LIT_PRIVATE_KEY as string,
        getChronicleProvider()
      )

      let code = await getLitActionCode(
        resolve('../../packages/lit-actions/dist/multisig.action.js')
      )
      if (!code) {
        return expect(code).toBeDefined()
      }
      code = code.replace('var threshold = 11337012321;', 'var threshold = 1;')
      code = code.replace('"%%OWNER_ADDRESS%%"', `"${signer.address}"`)

      const createNew = true
      const fund = true

      let pkpPromise: ReturnType<typeof factoryCreatePkp>
      if (createNew) {
        pkpPromise = factoryCreatePkp({ signer, ipfs: ipfsWrapper, code })
      } else {
        pkpPromise = Promise.resolve({
          pkpId: '0x840510e5e281d054fb3387b63a0b41cd2982f27651549c7215c76a652806b966',
          pkpPublicKey:
            '0x043447be4c2dd7818703e4b2647f56f765c767c3531a901741813488d39df98b1bb0bf73cf6e23267e34d911b096aee36017a12e1059aeb65f1c83bdd0e1d3559a',
          pkpAddress: '0xcb3a3B66985A1aA04cd657950Eb427809FeA5B6A',
          owner: '0x182351E16c1F511e50eA4438aFE3d0f16ae4769B',
          permittedActions: [],
          cid: 'QmZKewjzs2tB8WDfoQLBQRVCiv9bd9LXALfLf5vCQupArN'
        })
      }
      const pkp = await pkpPromise
      //
      //create a pkp here

      console.log('pkp', JSON.stringify(pkp, null, 2))
      const providerMumbai = getInfuraProvider(testnetChainId)
      const signerMumbai = new ethers.Wallet(process.env.LIT_PRIVATE_KEY as string, providerMumbai)
      if (fund) {
        await signerMumbai.sendTransaction({
          to: pkp.pkpAddress,
          value: ethers.utils.parseEther('0.001')
        })
        console.log('funded')
      }
      const client = new SqualletWalletBrowserClient(pkp, signerMumbai, testnetChainId, pkp.cid)
      const fee = await providerMumbai.getFeeData()
      const estimate = await providerMumbai.estimateGas({
        to: pkp.pkpAddress,
        from: pkp.pkpAddress,
        value: '0x0'
      })

      const { maxFeePerGas, maxPriorityFeePerGas } = fee
      if (!maxFeePerGas || !maxPriorityFeePerGas) {
        throw new Error('no fee')
      }

      const maxFee = estimate.mul(maxFeePerGas).mul(5)

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
                signerAddress: signerMumbai.address,
                signature: await signerMumbai.signMessage(hash)
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

      //todo test
      // expect(dataOutCompressed.length).toEqual(dataOut.length);
    })
  })
})
