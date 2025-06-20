import { squallet } from './squallet';
import { router } from './trpc';
import { user } from './user';
import { proposal } from './proposal';

export const appRouter = router({
    user,
    squallet,
    proposal,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
