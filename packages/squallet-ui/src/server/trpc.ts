import { TRPCError, initTRPC } from '@trpc/server';
import {
    AccessControlTypes,
    CreatorRequired,
    MemberRequired,
    OwnerRequired,
    TeamRequired,
    TokenRequired,
    checkAccessControl,
} from 'src/utils/access-control';
import superjson from 'superjson';
import { Context } from './context';
import prisma from 'src/utils/prisma';

export const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter({ shape }) {
        return shape;
    },
});

function createAccessControlledMiddleware(accessControl: AccessControlTypes) {
    return t.middleware(async ({ ctx, next }) => {
        const json = ctx.req?.body['0']?.json || ctx.req?.body?.json;
        const squalletId = json?.squalletId || json?.squallet?.id;

        if (accessControl !== TokenRequired && accessControl !== TeamRequired && !squalletId) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'missing request identifier' });
        }

        // Check access here
        const { ok, setResponse, recoveredAddress, code, squallet } = await checkAccessControl(
            accessControl,
            ctx.req,
            {
                squalletId,
            },
        );

        // Unauthorized
        if (!ok && code === 401) {
            throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        // Not found
        if (!ok && code === 404) {
            throw new TRPCError({ code: 'NOT_FOUND' });
        }

        // Error
        if (!ok && code === 500) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }

        // Fallback
        if (!ok) {
            throw new TRPCError({ code: 'BAD_REQUEST' });
        }

        let user = await prisma.user.findFirst({
            where: {
                address: recoveredAddress.toLocaleLowerCase(),
            },
        });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    address: recoveredAddress.toLocaleLowerCase(),
                },
            });
        }

        // Continue
        return next({
            ctx: {
                ...ctx,
                recoveredAddress: recoveredAddress.toLocaleLowerCase(),
                user,
                ok,
                squallet,
            },
        });
    });
}

export const userProcedure = t.procedure.use(createAccessControlledMiddleware(TokenRequired));

// // Creator of the squallet, immutable
// export const creatorProcedure = t.procedure.use(createAccessControlledMiddleware(CreatorRequired));

// // Basic member of the squallet
// export const memberProcedure = t.procedure.use(createAccessControlledMiddleware(MemberRequired));

// // Owner / Signer of the squallet
// export const ownerProcedure = t.procedure.use(createAccessControlledMiddleware(OwnerRequired));

// export const teamProcedure = t.procedure.use(createAccessControlledMiddleware(TeamRequired));
