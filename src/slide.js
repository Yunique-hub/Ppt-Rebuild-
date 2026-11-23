export const kinds = { text: '文字', image: '图片', shape: '形状' }

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export function fitGeometry(layer, slide) {
  const width = clamp(Math.round(layer.width), 1, slide.width)
  const height = clamp(Math.round(layer.height), 1, slide.height)
  return {
    ...layer,
    width,
    height,
    x: clamp(Math.round(layer.x), 0, slide.width - width),
    y: clamp(Math.round(layer.y), 0, slide.height - height),
  }
}

export function newLayer(kind, slide) {
  const width = slide.width
  const height = slide.height
  const fontSize = Math.max(12, Math.round(width * 0.046))
  const base = {
    id: crypto.randomUUID(), kind, name: kinds[kind], visible: true, source: 'manual',
    x: width * 0.14, y: height * 0.18, width: width * 0.43, height: height * 0.15,
  }
  return fitGeometry(kind === 'text'
    ? { ...base, text: '输入文字', fontSize, color: '#152128', bold: true }
    : { ...base, color: '#a8e6c2' }, slide)
}

export function moveLayer(layers, id, direction) {
  const index = layers.findIndex(layer => layer.id === id)
  const target = index + direction
  if (index < 0 || target < 0 || target >= layers.length) return layers
  const copy = [...layers]
  ;[copy[index], copy[target]] = [copy[target], copy[index]]
  return copy
}

export function cropRect(start, end) {
  return {
    x: Math.floor(Math.min(start.x, end.x)), y: Math.floor(Math.min(start.y, end.y)),
    width: Math.round(Math.abs(start.x - end.x)), height: Math.round(Math.abs(start.y - end.y)),
  }
}

export function recognizedLayers(blocks, slide, colorAt) {
  const lines = (blocks ?? []).flatMap(block => block.paragraphs.flatMap(p => p.lines))
  return lines.flatMap(line => {
    const text = line.text.trim()
    const { x0, y0, x1, y1 } = line.bbox
    if (!text || x1 <= x0 || y1 <= y0) return []
    const fontSize = Math.max(8, Math.round((y1 - y0) * 1.14))
    return [fitGeometry({
      id: crypto.randomUUID(), source: 'ocr', kind: 'text', visible: true,
      text, name: text.replace(/\s+/g, ' ').slice(0, 42), fontSize,
      color: colorAt(line.bbox), bold: false,
      x: x0, y: y0 - Math.round(fontSize * 0.12),
      width: (x1 - x0) * 1.12 + fontSize * 0.3, height: fontSize * 1.35,
    }, slide)]
  })
}

export function exportName(name) {
  const clean = name.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').replace(/[. ]+$/, '')
  return (clean || 'Slideform') + '.pptx'
}
