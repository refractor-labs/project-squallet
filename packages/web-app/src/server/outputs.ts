import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { AppRouter } from '@/server/routers/_app'

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>

export type RestorePkpOutput = RouterOutput['actions']['restorePkp']
