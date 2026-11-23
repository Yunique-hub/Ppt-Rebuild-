import React from 'react'
import { ArrowDown, ArrowUp, Eye, EyeOff, Image as ImageIcon, Layers3, Square, Trash2, Type, Upload } from 'lucide-react'

const icons = { text: Type, image: ImageIcon, shape: Square }
const labels = { text: '文本框', image: '图片图层', shape: '矩形' }

function NumberField({ label, value, onChange, min = 0 }) {
  return <label className="number-field"><span>{label}</span>
    <input type="number" min={min} value={value} onChange={e => {
      if (e.target.value !== '' && Number.isFinite(e.target.valueAsNumber)) onChange(e.target.valueAsNumber)
    }} />
  </label>
}

export function Inspector({ project, selected, onSelect, update, remove, move, replace, setBackground }) {
  const layer = project?.layers.find(item => item.id === selected)
  const Icon = icons[layer?.kind]
  const index = project?.layers.indexOf(layer)
  return (
    <aside className="inspector" aria-label="图层检查器">
      <section className="layer-section">
        <div className="aside-heading"><span><Layers3 size={17} /> 图层</span><span className="count-badge mono">{project?.layers.length ?? 0}</span></div>
        <div className="layer-list">
          {project?.layers.length ? [...project.layers].reverse().map(item => {
            const ItemIcon = icons[item.kind]
            const Visibility = item.visible ? Eye : EyeOff
            return <div className={'layer-row' + (item.id === selected ? ' active' : '') + (item.visible ? '' : ' layer-hidden')} key={item.id}>
              <button className="layer-name" aria-pressed={item.id === selected} onClick={() => onSelect(item.id)}>
                <span className={'layer-icon ' + item.kind}><ItemIcon size={15} /></span>
                <span>{item.name}</span>
              </button>
              <button className="icon-btn visibility" aria-label={item.visible ? '隐藏 ' + item.name : '显示 ' + item.name}
                onClick={() => update(item.id, { visible: !item.visible })}><Visibility size={15} /></button>
            </div>
          }) : <p className="aside-empty">这里会显示可编辑的图层。</p>}
        </div>
      </section>
      <section className="property-section">
        <div className="property-title">
          <span>{Icon && <Icon size={17} />}{layer ? labels[layer.kind] : '画布属性'}</span>
          {layer && <div className="property-actions">
            <button className="icon-btn" aria-label="上移一层" title="上移一层" disabled={index === project.layers.length - 1} onClick={() => move(layer.id, 1)}><ArrowUp size={15}/></button>
            <button className="icon-btn" aria-label="下移一层" title="下移一层" disabled={index === 0} onClick={() => move(layer.id, -1)}><ArrowDown size={15}/></button>
            <button className="icon-btn danger" aria-label="删除图层" title="删除图层" onClick={() => remove(layer.id)}><Trash2 size={15}/></button>
          </div>}
        </div>
        {layer && <div className="property-grid" key={layer.id}>
          <label className="field">图层名称<input value={layer.name} onChange={e => update(layer.id, { name: e.target.value })} /></label>
          {layer.kind === 'text' && <label className="field">文字内容
            <textarea rows="2" value={layer.text} onChange={e => update(layer.id, { text: e.target.value })} />
          </label>}
          <div className="coordinates">
            {[['x', 'X'], ['y', 'Y'], ['width', '宽'], ['height', '高']].map(([key, label]) =>
              <NumberField key={key} label={label} min={key.length > 1 ? 1 : 0} value={layer[key]}
                onChange={value => update(layer.id, { [key]: value })} />)}
          </div>
          {layer.kind === 'text' && <div className="type-options">
            <NumberField label="字号" min={1} value={layer.fontSize} onChange={fontSize => update(layer.id, { fontSize: Math.max(1, Math.min(1024, fontSize)) })} />
            <label className="color-input" title="文字颜色"><input type="color" aria-label="文字颜色" value={layer.color} onChange={e => update(layer.id, { color: e.target.value })} /></label>
            <button className="bold-button" aria-label="粗体" aria-pressed={layer.bold} onClick={() => update(layer.id, { bold: !layer.bold })}>B</button>
          </div>}
          {layer.kind === 'shape' && <label className="color-row">填充颜色<input type="color" value={layer.color} onChange={e => update(layer.id, { color: e.target.value })} /></label>}
          {layer.kind === 'image' && <button className="soft-button replace-image" onClick={() => replace(layer.id)}><Upload size={15} />替换图片</button>}
        </div>}
        {!layer && project && <label className="color-row">背景颜色<input type="color" value={project.background} onChange={e => setBackground(e.target.value)} /></label>}
      </section>
    </aside>
  )
}
