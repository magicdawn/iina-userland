# iina-userland

> iina userland utils

<!-- [![Build Status](https://img.shields.io/github/workflow/status/magicdawn/iina-userland/ci/main.svg?style=flat-square)](https://github.com/magicdawn/iina-userland/actions/workflows/ci.yml)
[![Coverage Status](https://img.shields.io/codecov/c/github/magicdawn/iina-userland.svg?style=flat-square)](https://codecov.io/gh/magicdawn/iina-userland)
[![npm version](https://img.shields.io/npm/v/iina-userland.svg?style=flat-square)](https://www.npmjs.com/package/iina-userland)
[![npm downloads](https://img.shields.io/npm/dm/iina-userland.svg?style=flat-square)](https://www.npmjs.com/package/iina-userland)
[![npm license](https://img.shields.io/npm/l/iina-userland.svg?style=flat-square)](http://magicdawn.mit-license.org) -->

## iina fork

use this fork for dev https://github.com/magicdawn/iina/

- with plugins flag turned on
- able to open webview devtools
- able to use webview.loadUrl, this means you can use any frontend tools, e.g Vite

I will constantly rebase `develop-tweak` branch onto `iina/develop` branch

### `loadUrl`

- `iina.standaloneWindow.loadFile` can load a html file
- this fork add a new `iina.standaloneWindow.loadUrl(url: string)` method.

to get started

- use create-vite to scaffold a new frontend project. e.g `pnpm create vite`
- after dev server started
- use `loadUrl('http://localhost:5173')`

## create-iina-plugin

> this is a wrapper of `generate-iina` using [create-with-generator](https://github.com/magicdawn/create-with-generator)

```sh
$ pnpm create iina-plugin
```

### generator-iina

> generate a iina plugin and setup a local dev environment

#### Usage

```sh
$ pnpm add -g yo generator-iina
$ yo iina
```

### Changelog

[packages/generator-iina/CHANGELOG.md](packages/generator-iina/CHANGELOG.md)

## License

the MIT License http://magicdawn.mit-license.org
