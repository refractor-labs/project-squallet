import { z } from 'zod'
import { procedure, router } from '../trpc'
import { actionsRouter } from '@/server/routers/actions'

export const appRouter = router({
  actions: actionsRouter
})
// export type definition of API
export type AppRouter = typeof appRouter
