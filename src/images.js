export const fileTypes = 'image/png,image/jpeg,image/webp'
const MAX_PIXELS = 24_000_000
const MAX_FILE_SIZE = 20 * 1024 * 1024

export function openImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('无法打开图片，请确认文件格式和内容。'))
    image.src = src
  })
}

export function surface(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas.getContext('2d', { willReadFrequently: true })
}

export async function importImage(file) {
  if (!fileTypes.split(',').includes(file.type)) throw new Error('请选择 PNG、JPG 或 WebP 图片。')
  if (file.size > MAX_FILE_SIZE) throw new Error('图片超过 20 MB。')
  const url = URL.createObjectURL(file)
  try {
    const image = await openImage(url)
    const width = image.naturalWidth
    const height = image.naturalHeight
    if (width * height > MAX_PIXELS || Math.max(width, height) > 10000) {
      throw new Error('图片尺寸过大，请先缩小至 2400 万像素以内。')
    }
    if (Math.min(width, height) < 24) throw new Error('图片最短边须至少为 24 像素。')
    const context = surface(width, height)
    context.drawImage(image, 0, 0)
    return { width, height, src: context.canvas.toDataURL('image/png'), background: estimateBackground(context) }
  } finally {
    URL.revokeObjectURL(url)
  }
}

function estimateBackground(context) {
  const { width, height } = context.canvas
  const colors = [[0.025, 0.025], [0.975, 0.025], [0.025, 0.975], [0.975, 0.975], [0.5, 0.025]]
    .map(([x, y]) => context.getImageData(Math.floor(x * width), Math.floor(y * height), 1, 1).data)
  const median = [0, 1, 2].map(channel => colors.map(p => p[3] < 128 ? 255 : p[channel]).sort((a, b) => a - b)[2])
  return '#' + median.map(n => n.toString(16).padStart(2, '0')).join('')
}

export function coverImage(context, image, x, y, width, height) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const sourceWidth = width / scale
  const sourceHeight = height / scale
  context.drawImage(image, (image.naturalWidth - sourceWidth) / 2, (image.naturalHeight - sourceHeight) / 2,
    sourceWidth, sourceHeight, x, y, width, height)
}

export async function cropImage(src, rect) {
  const image = await openImage(src)
  const context = surface(rect.width, rect.height)
  context.drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height)
  return context.canvas.toDataURL('image/png')
}
