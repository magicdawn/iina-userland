import { type TRPCLink } from '@trpc/client'
import { type AnyRouter } from '@trpc/server'
import { __createIINATrpcLinkInternal } from './internal'

export { BRIDGE_EMITTER_EVENT_NAME } from './internal'

export function createIINATrpcLink<TRouter extends AnyRouter = AnyRouter>(options?: {
  nsp?: string
}): TRPCLink<TRouter> {
  return __createIINATrpcLinkInternal<TRouter>(options).link
}
