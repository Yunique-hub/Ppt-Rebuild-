import { copyFile, mkdir } from 'node:fs/promises'

const projectRoot = new URL('../', import.meta.url)
const output = new URL('public/ocr/', projectRoot)
await mkdir(output, { recursive: true })

const files = {
  'tesseract-core-lstm.wasm.js': 'node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js',
  'eng.traineddata.gz': 'node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz',
  'chi_sim.traineddata.gz': 'node_modules/@tesseract.js-data/chi_sim/4.0.0_best_int/chi_sim.traineddata.gz',
  'LICENSE': 'node_modules/tesseract.js-core/LICENSE',
}

await Promise.all(Object.entries(files).map(([name, relative]) =>
  copyFile(new URL(relative, projectRoot), new URL(name, output))))
