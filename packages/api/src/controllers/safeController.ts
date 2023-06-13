import { ErrorResponse } from "../models/api";
import {
  Body,
  Controller,
  Post,
  Response,
  Route,
  Tags,
  Path,
  Get,
  Query,
  Patch,
  Delete,
} from "tsoa";
import { Signature, Transaction } from "@prisma/client";
import { prisma } from "../config";
import {
  hashUnsignedTransaction,
  UnsignedMpcTransaction,
} from "@refactor-labs-lit-protocol/litlib";

type TransactionDetailed = Transaction & {
  signatures: Signature[];
};

@Route("safe")
@Tags("safe")
@Response<ErrorResponse>("default")
export class SafeController extends Controller {
  @Post("{address}/transactions")
  public async createTransaction(
    @Path() address: string,
    @Body() transaction: any,
    @Query() topic: string,
    @Query() requestId: string
  ): Promise<TransactionDetailed> {
    const hash = hashUnsignedTransaction(transaction);
    const res = await prisma.transaction.create({
      data: {
        address: address.toLocaleLowerCase(),
        transaction,
        hash,
        topic,
        requestId,
      },
      include: {
        signatures: true,
      },
    });
    return res;
  }

  @Get("{address}/transactions")
  public async getTransactions(
    @Path() address: string
  ): Promise<TransactionDetailed[]> {
    return prisma.transaction.findMany({
      where: {
        address: address.toLocaleLowerCase(),
        hash: "",
      },
      include: {
        signatures: true,
      },
    });
  }

  @Patch("{address}/transactions/{transactionId}")
  public async patchTransaction(
    @Path() address: string,
    @Path() transactionId: string,
    @Query() hash: string
  ): Promise<TransactionDetailed> {
    return prisma.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        hash,
      },
      include: {
        signatures: true,
      },
    });
  }

  @Delete("{address}/transactions/{transactionId}")
  public async deleteTransaction(
    @Path() address: string,
    @Path() transactionId: string
  ): Promise<void> {
    await prisma.transaction.delete({
      where: {
        id: transactionId,
      },
    });
  }

  @Post("{address}/transactions/{transactionId}/signatures")
  public async createSignature(
    @Path() address: string,
    @Path() transactionId: string,
    @Query() signature: string,
    @Query() signer: string,
    @Query() nonce: number
  ): Promise<Signature> {
    await prisma.signature.deleteMany({
      where: {
        transactionId,
        signer: signer.toLocaleLowerCase(),
      },
    });
    return prisma.signature.create({
      data: {
        transactionId,
        signature,
        signer: signer.toLocaleLowerCase(),
        nonce,
      },
    });
  }
}
