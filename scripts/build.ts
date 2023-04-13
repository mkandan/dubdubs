import { build } from 'esbuild'
import { copyFile, cp, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const chromeOutputPath = resolve(process.cwd(), 'out/chrome')
const firefoxOutputPath = join(process.cwd(), 'out/firefox')
const contentScript = resolve(process.cwd(), 'app/content/content.ts')
const backgroundScript = resolve(process.cwd(), 'app/background/background.ts')

const manifestV2Path = join(process.cwd(), 'public/manifests/manifest.v2.json')
const manifestV3Path = join(process.cwd(), 'public/manifests/manifest.v3.json')

;(async () => {
  await build({
    entryPoints: [contentScript],
    outfile: `${chromeOutputPath}/content.js`,
    bundle: true,
    format: 'esm',
  })

  await build({
    entryPoints: [backgroundScript],
    outfile: `${chromeOutputPath}/background.js`,
    bundle: true,
    format: 'esm',
  })

  await cp(chromeOutputPath, firefoxOutputPath, { recursive: true })

  await Promise.all([
    copyFile(manifestV2Path, join(firefoxOutputPath, 'manifest.json')),
    copyFile(manifestV3Path, join(chromeOutputPath, 'manifest.json')),
  ])

  Promise.all([
    rm(join(chromeOutputPath, 'manifests'), { recursive: true, force: true }),
    rm(join(firefoxOutputPath, 'manifests'), { recursive: true, force: true }),
  ])
})()
