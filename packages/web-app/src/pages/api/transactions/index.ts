// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Transaction } from '@prisma/client'
import {
  hashUnsignedTransaction,
  serializeUnsignedTransaction,
  verifySignature
} from '@/lib/action/lit-lib'

type Response =
  | {
      data: Transaction | null
    }
  | {
      data: Transaction[]
    }
  | {
      error: string
    }
const prisma = new PrismaClient()

const errorResponse = (res: NextApiResponse<Response>, error: string) => {
  res.status(400).json({ error })
}

async function readTransaction(req: NextApiRequest, res: NextApiResponse<Response>) {
  const { signerHash } = req.query
  if (typeof signerHash !== 'string') {
    return errorResponse(res, 'address must be a string')
  }
  const transactions = await prisma.transaction.findFirst({
    where: {
      signerHash
    },
    include: {
      signatures: true
    }
  })
  res.status(200).json({ data: transactions })
}

async function readTransactions(req: NextApiRequest, res: NextApiResponse<Response>) {
  const { address } = req.query
  if (typeof address !== 'string') {
    return errorResponse(res, 'address must be a string')
  }
  const transactions = await prisma.transaction.findMany({
    where: {
      address
    },
    include: {
      signatures: true
    }
  })
  res.status(200).json({ data: transactions })
}

async function createTransaction(req: NextApiRequest, res: NextApiResponse<Response>) {
  const { address, transaction } = req.body
  if (typeof address !== 'string') {
    return errorResponse(res, 'address must be a string')
  }

  const signerHash = hashUnsignedTransaction(transaction)
  const existing = await prisma.transaction.findFirst({
    where: { signerHash }
  })
  if (!existing) {
    try {
      const transactionOut = await prisma.transaction.create({
        data: {
          address,
          transaction,
          signerHash
        }
      })
      console.log('created transaction', transactionOut)
    } catch (e) {
      if (e?.message?.includes('Unique constraint failed')) {
        console.log('transaction already exists')
      }
    }
  }
  const transactions = await prisma.transaction.findFirst({
    where: {
      signerHash
    },
    include: {
      signatures: true
    }
  })
  res.status(200).json({ data: transactions })
}

async function signTransaction(req: NextApiRequest, res: NextApiResponse<Response>) {
  const { address, transaction, signature, signerAddress } = req.body
  if (typeof address !== 'string') {
    return errorResponse(res, 'address must be a string')
  }

  const signerHash = hashUnsignedTransaction(transaction)
  if (signerAddress !== verifySignature(transaction, signature)) {
    return errorResponse(res, 'signature does not match signer address')
  }
  const existingTx = await prisma.transaction.findFirst({
    where: {
      signerHash
    }
  })
  if (!existingTx) {
    return errorResponse(res, 'transaction not found')
  }
  await prisma.signature.create({
    data: {
      signerAddress: signerAddress,
      signature,
      signerHash: signerHash,
      transaction: {
        connect: { signerHash }
      }
    }
  })
  const transactions = await prisma.transaction.findFirst({
    where: {
      signerHash
    },
    include: {
      signatures: true
    }
  })
  res.status(200).json({ data: transactions })
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  try {
    if (req.method === 'GET') {
      if (req.query.address) {
        return readTransactions(req, res)
      }
      return readTransaction(req, res)
    } else if (req.method === 'POST') {
      return createTransaction(req, res)
    } else if (req.method === 'PUT') {
      return signTransaction(req, res)
    }
    return res.status(405).json({ error: 'method not supported' })
  } catch (e) {
    console.error('Failed', e)
    return res.status(500).json({ error: 'internal server error' })
  }
}
