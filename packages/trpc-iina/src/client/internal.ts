import { postMessageLink } from '@elasticbottle/trpc-post-message/link'
import { type AnyRouter } from '@trpc/server'
import mitt from 'mitt'

export const BRIDGE_EMITTER_EVENT_NAME = 'RESPONSE' as const

export function __createIINATrpcLinkInternal<TRouter extends AnyRouter = AnyRouter>(options?: {
  nsp?: string
}) {
  const { nsp } = options || {}
  const prefix = `${nsp ? nsp + '.' : ''}`
  const reqevent = prefix + 'trpc-request'
  const resevent = prefix + 'trpc-response'

  const emitter = mitt<{ [BRIDGE_EMITTER_EVENT_NAME]: any }>()

  // 在网页端使用 iina.postMessage
  // 在 script 里使用 iina.standaloneWindow.onMessage 接收
  const iinaBridge = iina as any as IINA.API.StandaloneWindow
  iinaBridge.onMessage(resevent, (data) => {
    emitter.emit(BRIDGE_EMITTER_EVENT_NAME, data)
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
      emitter.on(BRIDGE_EMITTER_EVENT_NAME, customListener)
      return customListener
    },

    // 因为 trpc-post-message 对每个请求都会 addEventListener /  removeEventListener
    // 故引入 mitt 适配
    removeEventListener: (customListener) => {
      emitter.off(BRIDGE_EMITTER_EVENT_NAME, customListener)
    },
  })

  return { link, emitter }
}
