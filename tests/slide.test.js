import test from 'node:test'
import assert from 'node:assert/strict'
import { cropRect, exportName, fitGeometry, moveLayer, recognizedLayers } from '../src/slide.js'

const slide = { width: 1280, height: 720 }

test('fits a layer to the original slide without dropping metadata', () => {
  assert.deepEqual(fitGeometry({ x: 1270, y: -10, width: 43, height: 801, name: 'Photo' }, slide), {
    x: 1237, y: 0, width: 43, height: 720, name: 'Photo',
  })
})

test('normalizes a crop dragged in any direction', () => {
  assert.deepEqual(cropRect({ x: 27.3, y: 53.5 }, { x: 9, y: 4 }), { x: 9, y: 4, width: 18, height: 50 })
})

test('layer ordering preserves both the original array and the objects', () => {
  const source = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
  assert.deepEqual(moveLayer(source, 'b', -1).map(layer => layer.id), ['b', 'a', 'c'])
  assert.deepEqual(source.map(layer => layer.id), ['a', 'b', 'c'])
  assert.equal(moveLayer(source, 'c', 1), source)
})

test('OCR creates bounded native text layer candidates only for valid lines', () => {
  const blocks = [{ paragraphs: [{ lines: [
    { text: '  原生文本  ', bbox: { x0: 1130, x1: 1280, y0: 42, y1: 98 } },
    { text: ' ', bbox: { x0: 0, x1: 20, y0: 0, y1: 20 } },
    { text: 'invalid', bbox: { x0: 0, x1: 0, y0: 0, y1: 20 } },
  ] }] }]
  const layers = recognizedLayers(blocks, slide, () => '#123456')
  assert.equal(layers.length, 1)
  assert.equal(layers[0].text, '原生文本')
  assert.equal(layers[0].kind, 'text')
  assert.equal(layers[0].color, '#123456')
  assert.ok(layers[0].x + layers[0].width <= slide.width)
})

test('normalizes the .pptx filename while preserving Unicode', () => {
  assert.equal(exportName('  山地 / 系列.  '), '山地 - 系列.pptx')
  assert.equal(exportName('...'), 'Slideform.pptx')
})
