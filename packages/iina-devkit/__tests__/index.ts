import fse from 'fs-extra'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { IINA_PLUGINS_DIR, IINA_PLUGIN_DEV_SUFFIX, ensurePluginSymlink } from '../src'

describe('ensurePluginSymlink', () => {
  it('should works', async () => {
    await ensurePluginSymlink('hello.world', __dirname)
    const symlinkPath = path.join(IINA_PLUGINS_DIR, `hello.world${IINA_PLUGIN_DEV_SUFFIX}`)

    const stat = fse.lstatSync(symlinkPath)
    expect(stat.isSymbolicLink()).to.be.true

    const real = fse.realpathSync(symlinkPath)
    expect(real).to.equal(__dirname)

    await ensurePluginSymlink('hello.world', __dirname, true)
    expect(fse.existsSync(symlinkPath)).to.be.false
  })
})
