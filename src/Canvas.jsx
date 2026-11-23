import React, { useRef, useState } from 'react'
import { Image as ImageIcon, PencilRuler } from 'lucide-react'
import { clamp, cropRect } from './slide.js'

function relativeBox(box, project) {
  return {
    left: (box.x / project.width * 100) + '%',
    top: (box.y / project.height * 100) + '%',
    width: (box.width / project.width * 100) + '%',
    height: (box.height / project.height * 100) + '%',
  }
}

export function Canvas({ project, source, selected, zoom, crop, onCrop, onSelect, onMove }) {
  const frame = useRef(null)
  const gesture = useRef(null)
  const [selection, setSelection] = useState(null)
  const [draft, setDraft] = useState(null)

  function point(event) {
    const bounds = frame.current.getBoundingClientRect()
    return {
      x: clamp((event.clientX - bounds.left) / bounds.width * project.width, 0, project.width),
      y: clamp((event.clientY - bounds.top) / bounds.height * project.height, 0, project.height),
    }
  }

  function start(event, layer) {
    if (event.button !== 0) return
    if (layer) onSelect(layer.id)
    if (!layer && !crop) return
    gesture.current = { point: point(event), layer, pointer: event.pointerId }
    frame.current.setPointerCapture(event.pointerId)
  }

  function move(event) {
    const active = gesture.current
    if (!active || event.pointerId !== active.pointer) return
    const end = point(event)
    if (active.layer) {
      const { id, x, y, width, height } = active.layer
      setDraft({ id,
        x: clamp(x + end.x - active.point.x, 0, project.width - width),
        y: clamp(y + end.y - active.point.y, 0, project.height - height),
      })
    } else {
      setSelection(cropRect(active.point, end))
    }
  }

  function end(event, cancel = false) {
    const active = gesture.current
    if (!active || event.pointerId !== active.pointer) return
    gesture.current = null
    if (!cancel && active.layer) {
      const finish = point(event)
      if (Math.hypot(finish.x - active.point.x, finish.y - active.point.y) >= 1) {
        const { id, x, y } = active.layer
        onMove(id, { x: x + finish.x - active.point.x, y: y + finish.y - active.point.y })
      }
    }
    if (!cancel && !active.layer) onCrop(cropRect(active.point, point(event)))
    setDraft(null)
    setSelection(null)
  }

  const title = source ? '原始截图' : '重建画布'
  const Icon = source ? ImageIcon : PencilRuler
  return (
    <section className={'canvas-card' + (!source ? ' rebuilt-card' : '')} aria-label={title}>
      <div className="canvas-heading">
        <div><Icon size={16} /> <strong>{title}</strong></div>
        <span className={source ? 'canvas-tag source-tag' : 'canvas-tag editable-tag'}>{source ? '参考' : '可编辑'}</span>
      </div>
      <div className="canvas-scroll">
        <div className="canvas-mat" style={{ width: Math.max(100, zoom) + '%' }}>
          <div
            ref={frame}
            className={'slide-frame' + (crop ? ' crop-frame' : '')}
            style={{ aspectRatio: project.width + '/' + project.height, width: zoom < 100 ? zoom + '%' : '100%', background: source ? '#fff' : project.background }}
            onPointerDown={source && crop ? e => start(e) : undefined}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={e => end(e, true)}
          >
            {source ? <img className="source-image" src={project.src} alt="原始截图" draggable="false" /> :
              project.layers.filter(layer => layer.visible).map(layer => {
                const position = draft?.id === layer.id ? { ...layer, ...draft } : layer
                return (
                  <button className={'slide-layer ' + layer.kind + (selected === layer.id ? ' picked' : '')}
                    key={layer.id}
                    aria-label={layer.name}
                    aria-pressed={selected === layer.id}
                    style={{ ...relativeBox(position, project), '--font-scale': (layer.fontSize ?? 0) / project.width * 100,
                      color: layer.color, backgroundColor: layer.kind === 'shape' ? layer.color : undefined,
                      fontWeight: layer.bold ? 700 : 400 }}
                    onPointerDown={e => start(e, layer)}
                    onClick={() => onSelect(layer.id)}>
                    {layer.kind === 'text' && layer.text}
                    {layer.kind === 'image' && <img src={layer.src} alt="" draggable="false" />}
                  </button>
                )
              })}
            {source && crop && selection && <div className="crop-selection" style={relativeBox(selection, project)} />}
            {!source && !project.layers.some(layer => layer.visible) &&
              <div className="empty-slide">识别文字或添加图层后开始重建</div>}
          </div>
        </div>
      </div>
      <div className="canvas-footer">
        <span>{source ? project.fileName : 'PowerPoint 图层预览'}</span>
        <span className="mono">{project.width} × {project.height}</span>
      </div>
    </section>
  )
}
