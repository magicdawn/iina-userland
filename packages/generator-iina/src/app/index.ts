import Generator from 'yeoman-generator'
import yosay from 'yosay'
import pc from 'picocolors'
import { prompt } from 'enquirer'
import _ from 'lodash'
import fse from 'fs-extra'
import { join } from 'path'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const enquirerStyles = require('enquirer/lib/styles')

type GeneratorConstructorArgs = [args: string[], opts: object]

class AppLogicGenerator extends Generator {
  constructor(...args: GeneratorConstructorArgs) {
    super(...args)
    // console.log(...args)

    this.argument('pluginName', {
      type: String,
      description: 'the plugin name',
      optional: true,
    })
  }

  dir: string

  async run() {
    // Have Yeoman greet the user.
    this.log(yosay(`Welcome to ${pc.green('generator-iina')} generator !!!`))

    let pluginName = this.options.pluginName
    if (!pluginName) {
      // ask
      pluginName = (
        (await prompt({
          type: 'input',
          name: 'pluginName',
          message: 'specify plugin-name',
        })) as { pluginName: string }
      ).pluginName
    }

    const dir = _.kebabCase(pluginName)
    this.dir = dir
    const destRoot = join(process.cwd(), dir)
    fse.ensureDirSync(destRoot)

    this.sourceRoot(join(__dirname, '../../templates/app/'))
    this.destinationRoot(destRoot)

    if (!this.fs.exists(this.destinationPath('Info.json'))) {
      const answer = await prompt({
        type: 'snippet',
        name: 'infojson',
        message: 'Fill out the fields in Info.json',
        required: true,
        // @ts-ignore
        fields: [
          { name: 'pluginName', message: 'Plugin Name' },
          {
            name: 'pluginId',
            message: 'Plugin identifier, like iina.io.some-plugin',
            validate(value, state, item, index) {
              if (item && item.name === 'pluginId' && !/^[-_.\w]+$/.test(value)) {
                // @ts-ignore
                return enquirerStyles.danger('plugin identifier should match /^[w.-_]+$/')
              }
              return true
            },
          },
          { name: 'userName', message: 'user name' },
          { name: 'repoName', message: 'repo name' },
        ],
        template: `{
  "name": "\${pluginName:${pluginName}}",
  "identifier": "\${pluginId}",
  "version": "\${version:0.0.1}",
  "ghVersion": 3,
  "ghRepo": "\${userName:example-user}/\${repoName:example-repo}",
  "description": "\${description:a simple iina plugin}",
  "author": {
    "name": "\${userName:example-user}",
    "email": "\${userEmail:example-user@gmail.com}",
    "url": "https://iina.io"
  },
  "entry": "dist/index.js",
  "globalEntry": "dist/global.js",
  "permissions": ["show-osd", "network-request", "video-overlay", "file-system"],
  "allowedDomains": ["iina.io", "*.iina.io"],
  "preferencesPage": "pref.html",
  "preferenceDefaults": {}
}
`,
      })

      const infojson = (answer as any).infojson.result as string
      // console.log('creating Info.json')
      this.fs.writeJSON(this.destinationPath('Info.json'), JSON.parse(infojson))
    }

    const items = fse.readdirSync(this.sourceRoot())
    items.forEach((item) => {
      if (['Info.json', 'gitignore', '.npmignore', 'node_modules', 'dist'].includes(item)) return
      this.fs.copy(this.templatePath(item), this.destinationPath(item))
    })

    this.fs.copy(this.templatePath('gitignore'), this.destinationPath('.gitignore'))
  }

  end() {
    console.log('')
    console.log('To get started, run following commands:')
    console.log('')
    console.log(`  cd ./${this.dir}`)
    console.log(`  pnpm install`)
    console.log(`  pnpm dev`)
    console.log('')
  }
}

export default class AppGenerator extends AppLogicGenerator {
  prompting() {
    return this.run()
  }

  end() {
    return super.end()
  }
}
