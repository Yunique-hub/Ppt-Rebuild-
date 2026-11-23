import PptxGenJS from 'pptxgenjs'
import { coverImage, openImage, surface } from './images.js'
import { exportName } from './slide.js'

export async function exportSlide(project) {
  const pptx = new PptxGenJS()
  const units = 13.333 / Math.max(project.width, project.height)
  pptx.defineLayout({ name: 'SOURCE', width: project.width * units, height: project.height * units })
  pptx.layout = 'SOURCE'
  pptx.author = 'Slideform'
  pptx.title = project.name
  const slide = pptx.addSlide()
  slide.background = { color: project.background.slice(1) }

  for (const layer of project.layers.filter(item => item.visible)) {
    const rect = {
      x: layer.x * units, y: layer.y * units, w: layer.width * units, h: layer.height * units,
      objectName: layer.name,
    }
    if (layer.kind === 'text') {
      slide.addText(layer.text, {
        ...rect, fontFace: 'Microsoft YaHei', fontSize: layer.fontSize * units * 72,
        color: layer.color.slice(1), bold: layer.bold, margin: 0, valign: 'top', wrap: true,
      })
    } else if (layer.kind === 'shape') {
      slide.addShape(pptx.ShapeType.rect, { ...rect, fill: { color: layer.color.slice(1) }, line: { transparency: 100 } })
    } else {
      const image = await openImage(layer.src)
      const context = surface(layer.width, layer.height)
      coverImage(context, image, 0, 0, layer.width, layer.height)
      slide.addImage({ ...rect, data: context.canvas.toDataURL('image/png'), altText: layer.name })
    }
  }
  await pptx.writeFile({ fileName: exportName(project.name), compression: true })
}
