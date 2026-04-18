/**
 * build/icon.png kaynağından Windows (.ico) ve macOS (.icns) paket ikonları üretir.
 * public/icon.png ile aynı kaynak dosyayı kullanın (npm run generate-icons öncesi kopyalayın).
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import png2icons from 'png2icons'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const publicPng = join(root, 'public', 'icon.png')
const buildPng = join(root, 'build', 'icon.png')

if (!existsSync(publicPng)) {
    console.error('Eksik: public/icon.png')
    process.exit(1)
}

copyFileSync(publicPng, buildPng)

const input = readFileSync(buildPng)

const icns = png2icons.createICNS(input, png2icons.BILINEAR, 0)
if (!icns) {
    console.error('ICNS oluşturulamadı')
    process.exit(1)
}
writeFileSync(join(root, 'build', 'icon.icns'), icns)

const ico = png2icons.createICO(input, png2icons.BICUBIC2, 0, false, true)
if (!ico) {
    console.error('ICO oluşturulamadı')
    process.exit(1)
}
writeFileSync(join(root, 'build', 'icon.ico'), ico)

console.log('build/icon.ico ve build/icon.icns güncellendi (kaynak: public/icon.png)')
