import { Prisma } from '../../prisma';
import prisma from '../../utils/prisma';
import { router, publicProcedure } from './trpc';
import z from 'zod';

/**
 * Router for NFT Valuations
 */

const userInclude: Prisma.UserInclude = {
    squallets: {
        include: {
            squallet: true,
        },
    },
};
export const user = router({
    get: publicProcedure
        .input(
            z.object({
                address: z.string(),
            }),
        )
        .query(async ({ input }) => {
            const { address } = input;
            const user = await prisma.user.findFirst({
                where: {
                    address: address.toLocaleLowerCase(),
                },
                include: userInclude,
            });
            if (!user) {
                return prisma.user.create({
                    data: {
                        address: address.toLocaleLowerCase(),
                    },
                    include: userInclude,
                });
            }
            return user;
        }),
});
