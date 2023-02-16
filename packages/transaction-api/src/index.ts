import {} from "dotenv/config";
import express from "express";
import { PrismaClient, Transaction } from "@prisma/client";
import { Request, Response } from "express";
import cors from "cors";
import {
  hashUnsignedTransaction,
  verifySignature,
} from "../../web-app/src/lib/action/lit-lib";
import bodyParser from "body-parser";

const prisma = new PrismaClient();
const app = express();
app.use(bodyParser.json());

var corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors());

type ResponseData =
  | {
      data: Transaction | null;
    }
  | {
      data: Transaction[];
    }
  | {
      error: string;
    };

const errorResponse = (res: Response<ResponseData>, error: string) => {
  res.status(400).json({ error });
};
async function createTransaction(req: Request, res: Response<ResponseData>) {
  const { address, transaction } = req.body;
  if (typeof address !== "string") {
    return errorResponse(res, "address must be a string");
  }

  const signerHash = hashUnsignedTransaction(transaction);
  const existing = await prisma.transaction.findFirst({
    where: { signerHash },
  });
  if (!existing) {
    try {
      const transactionOut = await prisma.transaction.create({
        data: {
          address,
          transaction,
          signerHash,
        },
      });
      console.log("created transaction", transactionOut);
    } catch (e) {
      if ((e as unknown as any)?.toString()?.includes("Unique constraint")) {
        console.log("transaction already exists");
      }
    }
  }
  const transactions = await prisma.transaction.findFirst({
    where: {
      signerHash,
    },
    include: {
      signatures: true,
    },
  });
  res.status(200).json({ data: transactions });
}

async function signTransaction(req: Request, res: Response<ResponseData>) {
  const { address, transaction, signature, signerAddress } = req.body;
  if (typeof address !== "string") {
    return errorResponse(res, "address must be a string");
  }

  const signerHash = hashUnsignedTransaction(transaction);
  if (signerHash !== req.params.signerHash) {
    return errorResponse(res, "signerHash does not match transaction");
  }
  if (signerAddress !== verifySignature(transaction, signature)) {
    return errorResponse(res, "signature does not match signer address");
  }
  const existingTx = await prisma.transaction.findFirst({
    where: {
      signerHash,
    },
  });
  if (!existingTx) {
    return errorResponse(res, "transaction not found");
  }
  try {
    await prisma.signature.create({
      data: {
        signerAddress: signerAddress,
        signature,
        signerHash: signerHash,
        transaction: {
          connect: { signerHash },
        },
      },
    });
  } catch (e) {
    if ((e as unknown as any)?.toString()?.includes("Unique constraint")) {
      console.log("signature already exists");
    } else {
      throw e;
    }
  }
  const transactions = await prisma.transaction.findFirst({
    where: {
      signerHash,
    },
    include: {
      signatures: true,
    },
  });
  res.status(200).json({ data: transactions });
}

async function readTransaction(req: Request, res: Response) {
  const { signerHash } = req.params;
  // if (typeof signerHash !== "string") {
  //   return errorResponse(res, "address must be a string");
  // }
  const transactions = await prisma.transaction.findFirst({
    where: {
      signerHash,
    },
    include: {
      signatures: true,
    },
  });
  res.status(200).json({ data: transactions });
}
async function readTransactions(req: Request, res: Response) {
  const { address } = req.query;
  // if (typeof signerHash !== "string") {
  //   return errorResponse(res, "address must be a string");
  // }
  const transactions = await prisma.transaction.findMany({
    where: {
      address: typeof address === "string" ? address : undefined,
    },
    include: {
      signatures: true,
    },
  });
  res.status(200).json({ data: transactions });
}

// This is the endpoint for creating a new document
app.post("/transactions", async (req, res) => {
  try {
    // const data = req.body;
    await createTransaction(req, res);
    // const document = await prisma.transaction.create({ data });
    // res.status(200).json({ document });
  } catch (error) {
    console.log("failed to post", error);
    res.status(500).json({ error });
  }
});

// This is the endpoint for retrieving a document by its ID
app.get("/transactions/:signerHash", async (req, res) => {
  try {
    await readTransaction(req, res);
  } catch (error) {
    console.log("failed to read", error);
    res.status(500).json({ error });
  }
});

// This is the endpoint for retrieving a document by its ID
app.get("/transactions", async (req, res) => {
  try {
    await readTransactions(req, res);
  } catch (error) {
    console.log("failed to get", error);
    res.status(500).json({ error });
  }
});

// This is the endpoint for updating a document by its ID
app.put("/transactions/:signerHash/sign", async (req, res) => {
  try {
    await signTransaction(req, res);
  } catch (error) {
    console.log("failed to sign", error);
    res.status(500).json({ error });
  }
});

// This is the endpoint for deleting a document by its ID
app.delete("/transactions/:signerHash", async (req, res) => {
  try {
    const { signerHash } = req.params;
    const document = await prisma.transaction.delete({ where: { signerHash } });
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.status(200).json({ document });
  } catch (error) {
    console.log("failed to delete", error);
    res.status(500).json({ error });
  }
});
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log("Server is running on http://localhost:" + port);
});

process.on("SIGTERM", async () => {
  console.log("closed SIGTERM");
  await server.close();
  console.log("closed SIGTERM done");
});

process.on("SIGINT", async () => {
  console.log("closed SIGINT");
  await server.close();
  console.log("closed SIGINT done");
});
