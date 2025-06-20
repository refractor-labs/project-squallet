/**
 * This file contains tRPC's HTTP response handler
 */
import * as trpcNext from '@trpc/server/adapters/next';
import { createContext } from 'src/server/context';
// import { createContext } from 'src/server/context';
import { appRouter } from 'src/server/routers/_app';
// import { reportException } from 'src/sentry/capture';

// tRPC procedures that are expensive that we want to cache using stale-while-revalidate caching pattern
// cache request for 1 day + revalidate once every second
const cachedProcedures = [
    'fundingRound.equityFromLastRoundToNow',
    'squadValuation.totalNetWorth',
    'squadValuation.performance',
];

// export type definition of API
export type AppRouter = typeof appRouter;

export default trpcNext.createNextApiHandler({
    router: appRouter,
    /**
     * @link https://trpc.io/docs/context
     */
    createContext,
    /**
     * @link https://trpc.io/docs/error-handling
     */
    onError({ error }) {
        // if (process.env.NODE_ENV === 'production') {
        //     reportException(error, error.message);
        // }
        // if (error.code === 'INTERNAL_SERVER_ERROR') {
        //     // send to bug reporting
        //     console.error('Something went wrong', error);
        // }
    },
    /**
     * Enable query batching
     */
    batching: {
        enabled: true,
    },
    /**
     * @link https://trpc.io/docs/caching#api-response-caching
     */
    // responseMeta() {
    //   // ...
    // },
    responseMeta({ ctx, paths, type, errors }) {
        // assuming you have all your public routes with the keyword `public` in them

        const containsCachedPath = paths && paths.find((path) => cachedProcedures.includes(path));

        // checking that no procedures errored
        const allOk = errors.length === 0;
        // checking we're doing a query request
        const isQuery = type === 'query';

        if ((ctx as any)?.res && containsCachedPath && allOk && isQuery) {
            // cache request for 1 day + revalidate once every second
            const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
            return {
                headers: {
                    'cache-control': `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
                },
            };
        }
        return {};
    },
});
