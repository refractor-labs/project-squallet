import * as fs from 'fs'
import { create } from 'ipfs-http-client'

const errorLog = (...msg: any[]) => {
  console.log('\x1b[31m%s\x1b[0m', msg)
}

const getLitActionCode = async (file: string): Promise<string | undefined> => {
  const outFilePath = file

  let code

  try {
    code = await fs.promises.readFile(outFilePath)
    let codeString = code.toString()
    codeString = codeString.replace(
      `// global-externals:ethers
  var { ethers } = ethers;`,
      `// global-externals:ethers
  var ethers = ethers;`
    )
    return codeString
  } catch (e) {
    errorLog(
      '\n\x1b[31m%s\x1b[0m',
      `❌ ${outFilePath} not found\n\n   Please run "getlit build" first\n`
    )
  }
}

const projectId = process.env.IPFS_PROJECT_ID || ''
const projectSecret = process.env.IPFS_PROJECT_SECRET || ''
const authorization = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')

export const ipfs = create({
  url: 'https://ipfs.infura.io:5001',
  headers: {
    authorization
  }
})
// const helia = await createHelia();
// const s = strings(helia);

// const myImmutableAddress = await s.add("hello world");

// console.log(await s.get(myImmutableAddress));

const ipfsWrapper = async (code: string) => {
  const ipfsResp = await ipfs.add(code)
  return { cid: ipfsResp.cid.toString() }
}
export { getLitActionCode, errorLog, ipfsWrapper }
