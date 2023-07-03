# trpc-iina

> trpc adapter for use in IINA

## Install

```sh
$ pnpm add trpc-iina
```

## Setup

### server

```ts
// trpc-server.ts

import { initTRPC } from '@trpc/server'
import { z } from 'zod'

const t = initTRPC.create({
  isServer: false,
  allowOutsideOfServer: true,
})

const appRouter = t.router({
  // ...procedures
  echo: t.procedure.input(z.string()).query(async ({ input }): Promise<string> => {
    return Promise.resolve(input)
  }),
})

export type AppRouter = typeof appRouter

// here is the magic
import { createIINATrpcServer } from 'trpc-iina/server'
createIINATrpcServer(appRouter, {
  nsp: 'foo',
  debug: true,
})
```

### client

```ts
import { createTRPCProxyClient } from '@trpc/client'
import type { AppRouter } from 'somewhere-of-server'
import { createIINATrpcLink } from 'trpc-iina/client'

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    createIINATrpcLink({
      nsp: 'foo',
    }),
  ],
})
```

## Changelog

[CHANGELOG.md](CHANGELOG.md)

## License

the MIT License http://magicdawn.mit-license.org
