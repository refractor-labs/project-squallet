import { getLitActionCode, ipfsWrapper } from '../../utils'
import { resolve } from 'path'
import {
  factoryCreatePkp,
  getChronicleProvider,
  getInfuraProvider,
  SignTransactionRequest,
  SqualletWalletBrowserClient
} from '../../../src'
const ethers = require('ethers')

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

      const createNew = false
      const fund = false

      let pkpPromise: ReturnType<typeof factoryCreatePkp>
      if (createNew) {
        pkpPromise = factoryCreatePkp({ signer, ipfs: ipfsWrapper, code })
      } else {
        pkpPromise = Promise.resolve({
          pkpId: '0x49cf96b3f6ec2aade8e5be784fe6ac875c0bbf96952926e15dd9d2e9c6a3cf49',
          pkpPublicKey:
            '0x0448f283c87dcd7300ce0ec89019b03abc73ce5770df7671ee0640691ca2a42e1d64eb4c52d12823cf499d618b517afbdaef31041a52fb8b40c50cde6208398e48',
          pkpAddress: '0xaa579817166d04377Cba39692BDC676209C6f8Df',
          owner: '0x182351E16c1F511e50eA4438aFE3d0f16ae4769B',
          permittedActions: [],
          cid: 'QmQ8uvkhpSvki8NHP9A5bgvs3BwqsoQGsNpMRgrFpRppyr'
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
