import { coverImage, openImage, surface } from './images.js'

const background = '#142632'
const width = 1280
const height = 720

export async function makeDemo() {
  const photo = import.meta.env.BASE_URL + 'alpine-editorial.webp'
  const common = { visible: true, source: 'demo' }
  const layers = [
    { ...common, id: 'demo-photo', kind: 'image', name: '高山主图', src: photo, x: 540, y: 0, width: 740, height: 720 },
    { ...common, id: 'demo-rule', kind: 'shape', name: '绿色分隔线', color: '#b4e7c3', x: 65, y: 200, width: 58, height: 4 },
    { ...common, id: 'demo-series', kind: 'text', name: '系列名称', text: 'FIELD NOTES  /  ALPINE', color: '#b4e7c3', fontSize: 20, bold: true, x: 65, y: 108, width: 434, height: 33 },
    { ...common, id: 'demo-title', kind: 'text', name: '主标题', text: '野性之上', color: '#f8f9f3', fontSize: 87, bold: true, x: 62, y: 232, width: 458, height: 121 },
    { ...common, id: 'demo-subtitle', kind: 'text', name: '英文副标题', text: 'BEYOND THE TREELINE', color: '#b4e7c3', fontSize: 26, bold: true, x: 65, y: 371, width: 460, height: 39 },
    { ...common, id: 'demo-caption', kind: 'text', name: '页脚注记', text: '46° 51′ N  /  09° 31′ E', color: '#bac9ce', fontSize: 19, bold: false, x: 67, y: 622, width: 416, height: 33 },
  ]
  const context = surface(width, height)
  context.fillStyle = background
  context.fillRect(0, 0, width, height)
  for (const layer of layers) {
    const { x, y, width: w, height: h } = layer
    if (layer.kind === 'image') {
      coverImage(context, await openImage(layer.src), x, y, w, h)
    } else if (layer.kind === 'shape') {
      context.fillStyle = layer.color
      context.fillRect(x, y, w, h)
    } else {
      context.fillStyle = layer.color
      context.font = (layer.bold ? '700 ' : '400 ') + layer.fontSize + 'px "Microsoft YaHei", "PingFang SC", sans-serif'
      const metrics = context.measureText(layer.text)
      context.textBaseline = 'alphabetic'
      context.fillText(layer.text, x, y + (layer.fontSize * 1.13 + metrics.fontBoundingBoxAscent - metrics.fontBoundingBoxDescent) / 2, w)
    }
  }
  return {
    id: crypto.randomUUID(), name: '野性之上', fileName: 'alpine-field-notes.png',
    width, height, background, src: context.canvas.toDataURL('image/png'), layers, demo: true,
  }
}
