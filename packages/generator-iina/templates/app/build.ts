#!/usr/bin/env ts-node

import consola from 'consola'
import esbuild, { BuildOptions } from 'esbuild'
import { nodeBuiltin } from 'esbuild-node-builtin'
import { ensurePluginSymlink } from 'iina-devkit'
import { join } from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import Info from './Info.json'

const argv = yargs(hideBin(process.argv))
  .options({
    watch: {
      alias: ['w'],
      type: 'boolean',
      description: 'watch source file',
    },
    unlink: {
      type: 'boolean',
      default: false,
      description: 'unlink all symlinks',
    },
    prod: {
      type: 'boolean',
      default: false,
      description: 'use NODE_ENV=production for build',
    },
  })
  .parseSync()

main().catch(console.error)
async function main() {
  await ensurePluginSymlink(Info.identifier, __dirname, !!argv.unlink)
  await build()
}

async function build() {
  const outdir = join(__dirname, 'dist')
  const buildOptions: BuildOptions = {
    entryPoints: [
      //
      __dirname + '/src/index.ts',
      __dirname + '/src/global.ts',
    ],
    bundle: true,
    outdir,
    charset: 'utf8',
    platform: 'neutral',
    plugins: [nodeBuiltin()],
    mainFields: ['module', 'browser', 'main'],
    define: {
      'process.env.NODE_ENV': JSON.stringify(
        argv.prod ? 'production' : process.env.NODE_ENV || 'development'
      ),
    },
  }

  if (!argv.watch) {
    await esbuild.build(buildOptions)
    consola.success('bundled success')
  } else {
    const ctx = await esbuild.context({
      ...buildOptions,
      logLevel: 'info',
    })
    await ctx.watch()
  }
}
