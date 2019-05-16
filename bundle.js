#!/usr/bin/env node

const program = require('commander')
const sevenBin = require('7zip-bin')
const Seven = require('node-7z')
const Gauge = require('gauge')
const fs = require('fs-extra')
const path = require('path')

const pathTo7zip = sevenBin.path7za

program
  .version(require('./package').version)
  .usage('<command> [options]')

program
  .command('zip <arch>')
  .action(async arch => {
    const file = path.resolve(__dirname, `packed/${arch}.7z`)

    if (fs.existsSync(file)) {
      await fs.unlink(file)
    }

    const gauge = new Gauge()

    const stream = Seven.add(file, `unpacked/${arch}/*`, {
      $bin: pathTo7zip,
      $progress: true,
      recursive: true
    })

    stream.on('progress', progress => {
      gauge.show(`Files: ${Math.floor(progress.percent / 100 * progress.fileCount)}/${progress.fileCount}`, progress.percent / 100)
    })

    stream.on('end', () => {
      gauge.hide()
      console.log(`✌️ Done! 📄️  ${file} ready.`)
    })

    stream.on('error', e => {
      console.error(e)
    })
  })

program.parse(process.argv)
