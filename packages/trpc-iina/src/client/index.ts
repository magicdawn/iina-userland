import { postMessageLink } from '@elasticbottle/trpc-post-message/link'
import { type TRPCLink } from '@trpc/client'
import { type AnyRouter } from '@trpc/server'
import mitt from 'mitt'

export function createIINATrpcLink<TRouter extends AnyRouter = AnyRouter>(options?: {
  nsp?: string
}): TRPCLink<TRouter> {
  const { nsp } = options || {}
  const prefix = `${nsp ? nsp + '.' : ''}`
  const reqevent = prefix + 'trpc-request'
  const resevent = prefix + 'trpc-response'

  const EMITTER_EVENT_NAME = 'RESPONSE' as const
  const emitter = mitt<{ [EMITTER_EVENT_NAME]: any }>()

  // 在网页端使用 iina.postMessage
  // 在 script 里使用 iina.standaloneWindow.onMessage 接收
  const iinaBridge = iina as any as IINA.API.StandaloneWindow
  iinaBridge.onMessage(resevent, (data) => {
    emitter.emit(EMITTER_EVENT_NAME, data)
  })

  const link = postMessageLink<TRouter>({
    // send request
    postMessage: ({ message }) => {
      iinaBridge.postMessage(reqevent, message)
    },

    // receive response
    addEventListener: (listener) => {
      const customListener = (data) => {
        listener(new MessageEvent('message', { data }))
      }
      emitter.on(EMITTER_EVENT_NAME, customListener)
      return customListener
    },

    // 因为 trpc-post-message 对每个请求都会 addEventListener /  removeEventListener
    // 故引入 mitt 适配
    removeEventListener: (customListener) => {
      emitter.off(EMITTER_EVENT_NAME, customListener)
    },
  })

  return link
}
