import { build } from 'esbuild'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readdir } from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const electronDir = join(__dirname, '../electron')
const outDir = join(__dirname, '../dist-electron')

async function buildElectron() {
    const files = await readdir(electronDir)
    const tsFiles = files.filter(f => f.endsWith('.ts'))

    for (const file of tsFiles) {
        const entryPoint = join(electronDir, file)
        const outfile = join(outDir, file.replace('.ts', '.js'))

        // Preload script CommonJS formatında olmalı (Electron gereksinimi)
        // Main script ESM formatında olabilir
        const format = file === 'preload.ts' ? 'cjs' : 'esm'

        await build({
            entryPoints: [entryPoint],
            bundle: true,
            platform: 'node',
            target: 'node18',
            format: format,
            outfile,
            external: ['electron'],
            sourcemap: true,
        })

        console.log(`✓ Built ${file} (${format})`)
    }
}

buildElectron().catch(console.error)

