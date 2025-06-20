import { SqualletDetailed } from 'src/types';
import prisma from '../../utils/prisma';
import { createSquallet } from '../lib/squallet';
import { router, publicProcedure } from './trpc';
import z from 'zod';
import { userProcedure } from '../trpc';

/**
 * Router for NFT Valuations
 */
export const squallet = router({
    create: userProcedure
        .input(
            z.object({
                name: z.string(),
                signers: z.array(z.string()),
                threshold: z.number(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const { recoveredAddress } = ctx;
            const user = await prisma.user.findFirst({
                where: {
                    address: recoveredAddress.toLocaleLowerCase(),
                },
            });
            if (!user) {
                throw new Error('Missing user');
            }
            const resp = await createSquallet(input.signers, input.threshold);
            const squallet = await prisma.squallet.create({
                data: {
                    name: input.name,
                    threshold: input.threshold,
                },
            });
            const pkp = await prisma.pkp.create({
                data: {
                    pkpAddress: resp.pkpAddress,
                    pkpId: resp.pkpId,
                    pkpPublicKey: resp.pkpPublicKey,
                    squalletId: squallet.id,
                },
            });
            for (const action of resp.permittedActions) {
                await prisma.action.create({
                    data: {
                        actionId: action.id,
                        cid: action.cid,
                        pkpId: pkp.id,
                    },
                });
            }
            for (const signer of input.signers) {
                const address = signer.toLocaleLowerCase();
                let user = await prisma.user.findFirst({
                    where: {
                        address,
                    },
                });
                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            address,
                        },
                    });
                }
                await prisma.squalletUser.create({
                    data: {
                        role: 'SIGNER',
                        userId: user.id,
                        squalletId: squallet.id,
                    },
                });
            }
            return prisma.squallet.findFirst({
                where: {
                    id: squallet.id,
                },
                include: {
                    pkp: {
                        include: {
                            actions: true,
                        },
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
        .query(async ({ input }): Promise<SqualletDetailed | null> => {
            return prisma.squallet.findFirst({
                where: {
                    id: input.id,
                },
                include: {
                    users: {
                        include: {
                            user: true,
                        },
                    },
                    pkp: {
                        include: {
                            actions: true,
                        },
                    },
                },
            });
        }),

    list: userProcedure
        .input(
            z.object({
                address: z.string(),
            }),
        )
        .query(async ({ input }): Promise<SqualletDetailed[]> => {
            const { address } = input;
            const ret = await prisma.squalletUser.findMany({
                where: {
                    user: {
                        address,
                    },
                },
                include: {
                    squallet: {
                        include: {
                            users: {
                                include: {
                                    user: true,
                                },
                            },
                            pkp: {
                                include: {
                                    actions: true,
                                },
                            },
                        },
                    },
                },
            });
            return ret.map((r) => r.squallet);
        }),

    update: publicProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            const { id } = input;
            const proposal = await prisma.squallet.update({
                where: {
                    id,
                },
                data: {
                    name: input.name,
                },
            });
            return proposal;
        }),
});
