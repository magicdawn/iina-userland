import { execSync } from 'child_process'
import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  return {
    entry: ['src/server/index.ts', 'src/client/index.ts'],
    splitting: false,
    sourcemap: true,
    dts: true,
    format: ['cjs', 'esm'],
    minify: false,
    clean: true,
    outDir: 'lib',
    async onSuccess() {
      execSync('cp ./package.json ./README.md ./CHANGELOG.md ./lib', { cwd: __dirname })
    },
  }
})
