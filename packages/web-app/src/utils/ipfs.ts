import { create } from 'ipfs-http-client'

const projectId = process.env.NEXT_PUBLIC_IPFS_PROJECT_ID || ''
const projectSecret = process.env.NEXT_PUBLIC_IPFS_PROJECT_SECRET || ''
const authorization = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')

export const ipfs = create({
  url: 'https://ipfs.infura.io:5001',
  headers: {
    authorization
  }
})
