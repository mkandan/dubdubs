import { config } from 'dotenv'
import { build } from 'esbuild'
import { copyFile, cp, rename, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import util from 'util'

const exec = util.promisify(require('child_process').exec)

config({
  path: join(process.cwd(), '.env'),
})

const chromeOutputPath = resolve(process.cwd(), 'out/chrome')
const firefoxOutputPath = join(process.cwd(), 'out/firefox')
const contentFolder = join(process.cwd(), 'app/content')
const contentScript = resolve(process.cwd(), 'app/content/content.ts')
const backgroundScript = resolve(process.cwd(), 'app/background/background.ts')

const manifestV2Path = join(process.cwd(), 'public/manifests/manifest.v2.json')
const manifestV3Path = join(process.cwd(), 'public/manifests/manifest.v3.json')

const define: any = {}

for (const k in process.env) {
  define[`process.env.${k}`] = JSON.stringify(process.env[k])
}

;(async () => {
  await build({
    entryPoints: [contentScript],
    outfile: `${chromeOutputPath}/content.js`,
    bundle: true,
    format: 'esm',
    define,
  })

  await build({
    entryPoints: [backgroundScript],
    outfile: `${chromeOutputPath}/background.js`,
    bundle: true,
    format: 'esm',
    define,
  })

  await cp(
    join(contentFolder, 'content.css'),
    join(chromeOutputPath, 'content.css'),
  )
  await cp(chromeOutputPath, firefoxOutputPath, { recursive: true })

  await Promise.all([
    copyFile(manifestV2Path, join(firefoxOutputPath, 'manifest.json')),
    copyFile(manifestV3Path, join(chromeOutputPath, 'manifest.json')),
  ])

  Promise.all([
    rm(join(chromeOutputPath, 'manifests'), { recursive: true, force: true }),
    rm(join(firefoxOutputPath, 'manifests'), { recursive: true, force: true }),
  ])

  await rename(join(chromeOutputPath, '_next'), join(chromeOutputPath, 'next'))

  exec('sed -i "s/\\/_next/\\/next/g" out/chrome/index.html')
})()
