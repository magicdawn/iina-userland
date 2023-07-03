import consola from 'consola'
import fse from 'fs-extra'
import { homedir } from 'os'
import path, { join } from 'path'
import symlinkDir from 'symlink-dir'

export const IINA_PLUGINS_DIR = join(
  homedir(),
  'Library/Application Support/com.colliderli.iina/plugins'
)

export const IINA_PLUGIN_DEV_SUFFIX = '.iinaplugin-dev'

export async function ensurePluginSymlink(
  pluginIdentifier: string,
  symlinkTargetDir: string,
  remove = false
) {
  const pluginSubdir = pluginIdentifier + IINA_PLUGIN_DEV_SUFFIX

  // prune existing  symlinks
  fse
    .readdirSync(IINA_PLUGINS_DIR)
    .filter((item) => item.endsWith(IINA_PLUGIN_DEV_SUFFIX))
    .forEach((name) => {
      const fullname = join(IINA_PLUGINS_DIR, name)
      const stat = fse.lstatSync(fullname) // do not follow symlinks
      if (!stat.isSymbolicLink()) return

      // 多个 symlink 指向当前文件夹
      const symlinkTarget = path.resolve(IINA_PLUGINS_DIR, fse.readlinkSync(fullname))
      if (symlinkTarget === __dirname && name !== pluginSubdir) {
        consola.info('symlink prune legacy symlink: %s', fullname)
        fse.removeSync(fullname)
      }
    })

  // create
  const symlinkPath = join(IINA_PLUGINS_DIR, pluginSubdir)

  if (remove) {
    fse.removeSync(symlinkPath)
    consola.success('symlink unlink success %s', symlinkPath)
  } else {
    // why not fse.symlinkSync(symlinkTo, symlinkFrom)
    // Error: EEXIST: file already exists, symlink
    await symlinkDir(symlinkTargetDir, symlinkPath, { overwrite: true })
    consola.success('symlink success %s -> %s', symlinkPath, symlinkTargetDir)
  }
}
