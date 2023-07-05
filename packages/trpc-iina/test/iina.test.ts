/**
 * taken from https://github.com/ElasticBottle/trpc-post-message/blob/main/test/postmessage.test.ts
 * the MIT License
 */

/// <reference types="iina-plugin-definition" />

import { createTRPCProxyClient } from '@trpc/client'
import { initTRPC } from '@trpc/server'
import { observable, Unsubscribable } from '@trpc/server/observable'
import mitt from 'mitt'
import { beforeAll, expect, test, vi } from 'vitest'
import { z } from 'zod'
import { __createIINATrpcLinkInternal, BRIDGE_EMITTER_EVENT_NAME } from '../src/client/internal'
import { createIINATrpcServer } from '../src/server'

const mockEmitter1 = mitt()
const mockEmitter2 = mitt()

type IINAEmitter = Pick<IINA.API.StandaloneWindow, 'postMessage' | 'onMessage'>
const iinaStandlonwWindowMock: IINAEmitter = {
  postMessage(name: string, data: any) {
    mockEmitter2.emit(name, data)
  },
  onMessage: vi.fn().mockImplementation((name: string, callback: (data: any) => void) => {
    mockEmitter1.on(name, callback)
  }),
}
const iinaWebpageMock: IINAEmitter = {
  postMessage(name: string, data: any) {
    mockEmitter1.emit(name, data)
  },
  onMessage: vi.fn().mockImplementation((name: string, callback: (data: any) => void) => {
    mockEmitter2.on(name, callback)
  }),
}

const iinaMock = {
  standaloneWindow: iinaStandlonwWindowMock,
  ...iinaWebpageMock,
}
vi.stubGlobal('iina', iinaMock)

const t = initTRPC.create()

const appRouter = t.router({
  echoQuery: t.procedure.input(z.object({ payload: z.string() })).query(({ input }) => input),
  echoMutation: t.procedure.input(z.object({ payload: z.string() })).mutation(({ input }) => input),
  echoSubscription: t.procedure.input(z.object({ payload: z.string() })).subscription(({ input }) =>
    observable<typeof input>((emit) => {
      emit.next(input)
    })
  ),
  nestedRouter: t.router({
    echoQuery: t.procedure.input(z.object({ payload: z.string() })).query(({ input }) => input),
    echoMutation: t.procedure
      .input(z.object({ payload: z.string() }))
      .mutation(({ input }) => input),
    echoSubscription: t.procedure
      .input(z.object({ payload: z.string() }))
      .subscription(({ input }) =>
        observable((emit) => {
          emit.next(input)
        })
      ),
  }),
})

beforeAll(() => {
  createIINATrpcServer(appRouter, { nsp: 'test' })
  expect(iina.standaloneWindow.onMessage).toHaveBeenCalledTimes(1)
})

test('with query', async () => {
  // client
  const { link, emitter } = __createIINATrpcLinkInternal({ nsp: 'test' })
  const trpc = createTRPCProxyClient<typeof appRouter>({
    links: [link],
  })

  const data1 = await trpc.echoQuery.query({ payload: 'query1' })
  expect(data1).toEqual({ payload: 'query1' })
  expect(emitter.all.get(BRIDGE_EMITTER_EVENT_NAME)?.length).to.equal(0)

  const data2 = await trpc.nestedRouter.echoQuery.query({ payload: 'query2' })
  expect(data2).toEqual({ payload: 'query2' })
  expect(emitter.all.get(BRIDGE_EMITTER_EVENT_NAME)?.length).to.equal(0)

  const [data3, data4] = await Promise.all([
    trpc.echoQuery.query({ payload: 'query3' }),
    trpc.echoQuery.query({ payload: 'query4' }),
  ])
  expect(data3).toEqual({ payload: 'query3' })
  expect(data4).toEqual({ payload: 'query4' })
  expect(emitter.all.get(BRIDGE_EMITTER_EVENT_NAME)?.length).to.equal(0)
})

test('with mutation', async () => {
  // client
  const { link, emitter } = __createIINATrpcLinkInternal({ nsp: 'test' })
  const trpc = createTRPCProxyClient<typeof appRouter>({
    links: [link],
  })

  const data1 = await trpc.echoMutation.mutate({ payload: 'mutation1' })
  expect(data1).toEqual({ payload: 'mutation1' })
  expect(emitter.all.get(BRIDGE_EMITTER_EVENT_NAME)?.length).to.equal(0)

  const data2 = await trpc.nestedRouter.echoMutation.mutate({
    payload: 'mutation2',
  })
  expect(data2).toEqual({ payload: 'mutation2' })
  expect(emitter.all.get(BRIDGE_EMITTER_EVENT_NAME)?.length).to.equal(0)

  const [data3, data4] = await Promise.all([
    trpc.echoMutation.mutate({ payload: 'mutation3' }),
    trpc.echoMutation.mutate({ payload: 'mutation4' }),
  ])
  expect(data3).toEqual({ payload: 'mutation3' })
  expect(data4).toEqual({ payload: 'mutation4' })
  expect(emitter.all.get(BRIDGE_EMITTER_EVENT_NAME)?.length).to.equal(0)
})

test('with subscription', async () => {
  // client
  const { link, emitter } = __createIINATrpcLinkInternal({ nsp: 'test' })
  const trpc = createTRPCProxyClient<typeof appRouter>({
    links: [link],
  })

  const onDataMock = vi.fn()
  const onCompleteMock = vi.fn()
  const onErrorMock = vi.fn()
  const onStartedMock = vi.fn()
  const onStoppedMock = vi.fn()
  const subscription = await new Promise<Unsubscribable>((resolve) => {
    const subscription = trpc.echoSubscription.subscribe(
      { payload: 'subscription1' },
      {
        onData: (data) => {
          onDataMock(data)
          resolve(subscription)
        },
        onComplete: () => {
          onCompleteMock()
        },
        onError: onErrorMock,
        onStarted: onStartedMock,
        onStopped: onStoppedMock,
      }
    )
  })
  expect(onDataMock).toHaveBeenCalledTimes(1)
  expect(onDataMock).toHaveBeenNthCalledWith(1, { payload: 'subscription1' })
  expect(onCompleteMock).toHaveBeenCalledTimes(0)
  expect(onErrorMock).toHaveBeenCalledTimes(0)
  expect(onStartedMock).toHaveBeenCalledTimes(1)
  expect(onStoppedMock).toHaveBeenCalledTimes(0)
  expect(emitter.all.get(BRIDGE_EMITTER_EVENT_NAME)?.length).to.equal(1)

  subscription.unsubscribe()
  expect(onDataMock).toHaveBeenCalledTimes(1)
  expect(onCompleteMock).toHaveBeenCalledTimes(1)
  expect(onErrorMock).toHaveBeenCalledTimes(0)
  expect(onStartedMock).toHaveBeenCalledTimes(1)
  expect(onStoppedMock).toHaveBeenCalledTimes(1)
  expect(emitter.all.get(BRIDGE_EMITTER_EVENT_NAME)?.length).to.equal(0)
})
