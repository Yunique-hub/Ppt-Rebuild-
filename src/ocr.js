import { createWorker, PSM } from 'tesseract.js'
import workerPath from 'tesseract.js/dist/worker.min.js?url'
import { openImage, surface } from './images.js'
import { recognizedLayers } from './slide.js'

const status = {
  'loading tesseract core': '加载识别引擎',
  'initializing tesseract': '初始化识别引擎',
  'loading language traineddata': '下载语言包',
  'initializing api': '准备识别',
  'recognizing text': '识别文字',
}

export async function recognizeSlide(slide, language, progress) {
  const image = await openImage(slide.src)
  const width = Math.min(slide.width, Math.max(1, Math.round(2400 * slide.width / Math.max(slide.width, slide.height))))
  const ratio = slide.width / width
  const height = Math.max(1, Math.round(slide.height / ratio))
  const context = surface(width, height)
  context.fillStyle = slide.background
  context.fillRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)
  let worker
  let timer
  let timedOut = false
  let rejectWorker
  const failure = new Promise((_, reject) => { rejectWorker = reject })
  try {
    const recognition = (async () => {
      worker = await createWorker(language, 1, {
        workerPath,
        corePath: import.meta.env.BASE_URL + 'ocr/tesseract-core-lstm.wasm.js',
        langPath: import.meta.env.BASE_URL + 'ocr',
        errorHandler: () => rejectWorker(new Error('识别引擎加载失败，请重新加载工作台后重试。')),
        logger: event => { if (!timedOut) progress(status[event.status] ?? '准备识别', event.progress) },
      })
      if (timedOut) {
        await worker.terminate()
        return null
      }
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT })
      return worker.recognize(context.canvas, {}, { blocks: true })
    })()
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        timedOut = true
        reject(new Error('识别超时，请重新加载工作台后重试。'))
      }, 90000)
    })
    const { data } = await Promise.race([recognition, timeout, failure])
    function colorAt(box) {
      const x = Math.max(0, Math.min(width - 1, Math.floor(box.x0 / ratio) - 2))
      const y = Math.max(0, Math.min(height - 1, Math.floor(box.y0 / ratio) - 2))
      const pixel = context.getImageData(x, y, 1, 1).data
      return pixel[0] * 0.2126 + pixel[1] * 0.7152 + pixel[2] * 0.0722 < 140 ? '#f5f7f8' : '#152128'
    }
    const blocks = (data.blocks ?? []).map(block => ({ paragraphs: block.paragraphs.map(paragraph => ({
      lines: paragraph.lines.map(line => ({
        ...line, bbox: Object.fromEntries(Object.entries(line.bbox).map(([key, value]) => [key, value * ratio])),
      })),
    })) }))
    return recognizedLayers(blocks, slide, colorAt)
  } finally {
    clearTimeout(timer)
    if (worker) await worker.terminate()
  }
}
