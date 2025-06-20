import { ProposalStage, ProposalType } from 'src/prisma';
import prisma from '../../utils/prisma';
import { router, publicProcedure } from './trpc';
import z from 'zod';
import { userProcedure } from '../trpc';

export const proposal = router({
    create: userProcedure
        .input(
            z.object({
                squalletId: z.string(),
                description: z.string(),
                name: z.string(),
                proposalType: z.nativeEnum(ProposalType),
                data: z.any(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const { user } = ctx;
            const squalletUser = await prisma.squalletUser.findFirst({
                where: {
                    squalletId: input.squalletId,
                    role: 'SIGNER',
                    userId: user.id,
                },
            });
            if (!squalletUser) {
                return null;
            }
            const proposal = await prisma.proposal.create({
                data: {
                    squalletId: input.squalletId,
                    description: input.description,
                    name: input.name,
                    proposalStage: 'PROPOSED',
                    proposalType: input.proposalType,
                    data: input.data,
                    creatorId: user.id,
                },
                include: {
                    executions: true,
                    signatures: true,
                    creator: true,
                },
            });
            return proposal;
        }),

    addSignature: userProcedure
        .input(
            z.object({
                proposalId: z.string(),
                signature: z.string(),
                nonce: z.number(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const { recoveredAddress } = ctx;
            const proposal = await prisma.proposal.findFirst({
                where: {
                    id: input.proposalId,
                    proposalStage: 'PROPOSED',
                },
            });
            if (!proposal) {
                return null;
            }
            const signer = await prisma.squalletUser.findMany({
                where: {
                    squalletId: proposal.squalletId,
                    role: 'SIGNER',
                    user: {
                        address: recoveredAddress.toLocaleLowerCase(),
                    },
                },
                include: {
                    user: true,
                },
            });
            if (!signer) {
                return null;
            }
            return prisma.signature.upsert({
                where: {
                    address_proposalId: {
                        address: recoveredAddress.toLocaleLowerCase(),
                        proposalId: input.proposalId,
                    },
                },
                update: {
                    nonce: input.nonce,
                    signature: input.signature,
                },
                create: {
                    nonce: input.nonce,
                    address: recoveredAddress.toLocaleLowerCase(),
                    proposalId: input.proposalId,
                    signature: input.signature,
                },
            });
        }),

    execute: userProcedure
        .input(
            z.object({
                proposalId: z.string(),
                signature: z.string(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const { recoveredAddress } = ctx;
            const proposal = await prisma.proposal.findFirst({
                where: {
                    id: input.proposalId,
                    proposalStage: 'PROPOSED',
                },
            });
            if (!proposal) {
                return null;
            }
            const signer = await prisma.squalletUser.findMany({
                where: {
                    squalletId: proposal.squalletId,
                    role: 'SIGNER',
                    user: {
                        address: recoveredAddress.toLocaleLowerCase(),
                    },
                },
                include: {
                    user: true,
                },
            });
            if (!signer) {
                return null;
            }
            await prisma.execution.create({
                data: {
                    proposalId: input.proposalId,
                    signature: input.signature,
                },
            });

            return prisma.proposal.update({
                where: {
                    id: proposal.id,
                },
                data: {
                    proposalStage: 'EXECUTED',
                },
                include: {
                    executions: true,
                    signatures: true,
                    creator: true,
                },
            });
        }),
    proposalsBySquallet: publicProcedure
        .input(
            z.object({
                squalletId: z.string(),
                proposalStage: z.nativeEnum(ProposalStage).optional(),
            }),
        )
        .query(async ({ input }) => {
            const { squalletId } = input;
            return prisma.proposal.findMany({
                where: {
                    squalletId,
                    proposalStage: input.proposalStage ?? { not: 'PROPOSED' },
                },
                include: {
                    executions: true,
                    signatures: true,
                    creator: true,
                },
                orderBy: {
                    createdAt: 'asc',
                },
            });
        }),

    count: publicProcedure
        .input(
            z.object({
                squalletId: z.string(),
            }),
        )
        .query(async ({ input }) => {
            const { squalletId } = input;
            return prisma.proposal.count({
                where: {
                    squalletId,
                    proposalStage: {
                        not: 'CANCELLED',
                    },
                },
            });
        }),

    get: publicProcedure
        .input(
            z.object({
                id: z.string(),
            }),
        )
        .query(async ({ input }) => {
            const { id } = input;
            const proposal = await prisma.proposal.findFirst({
                where: {
                    id,
                },
                include: {
                    executions: true,
                    signatures: true,
                    creator: true,
                },
            });
            return proposal;
        }),

    update: publicProcedure
        .input(
            z.object({
                id: z.string(),
                proposalStage: z.nativeEnum(ProposalStage),
            }),
        )
        .mutation(async ({ input }) => {
            const { id } = input;
            const proposal = await prisma.proposal.update({
                where: {
                    id,
                },
                data: {
                    proposalStage: input.proposalStage,
                },
            });
            return proposal;
        }),
});
