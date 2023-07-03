import { createPostMessageHandler } from '@elasticbottle/trpc-post-message/adapter'
import { AnyRouter } from '@trpc/server'

export function createIINATrpcServer(
  appRouter: AnyRouter,
  options?: { nsp?: string; debug?: boolean }
) {
  const { nsp, debug } = options || {}
  const prefix = `${nsp ? nsp + '.' : ''}`
  const reqevent = prefix + 'trpc-request'
  const resevent = prefix + 'trpc-response'

  createPostMessageHandler({
    router: appRouter,

    // send response
    postMessage: ({ message }) => {
      if (debug) console.log(`in ${resevent}`, message)
      iina.standaloneWindow.postMessage(resevent, message)
    },

    // handle request
    addEventListener: (listener) => {
      iina.standaloneWindow.onMessage(reqevent, (requestDetail) => {
        if (debug) console.log(`in ${reqevent}`, requestDetail)
        // should be `new MessageEvent('message', { data })`
        // but not available, so ts ignore
        // @ts-ignore
        listener({ data: requestDetail })
      })
    },
  })
}
