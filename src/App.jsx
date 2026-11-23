import React, { useEffect, useRef, useState } from 'react'
import {
  ArrowDownToLine, Check, CircleHelp, Columns2, Crop, FileImage, FolderOpen, CodeXml, Image as ImageIcon,
  Layers3, LoaderCircle, Minus, Plus, ScanLine, ShieldCheck, Square, Type, Upload, X,
} from 'lucide-react'
import { Canvas } from './Canvas.jsx'
import { Inspector } from './Inspector.jsx'
import { cropImage, fileTypes, importImage } from './images.js'
import { clamp, fitGeometry, moveLayer, newLayer } from './slide.js'
import { makeDemo } from './demo.js'

const repo = 'https://github.com/Yunique-hub/Ppt-Rebuild-'
const views = [['compare', '对照'], ['source', '原图'], ['edit', '重建']]
const languages = [['chi_sim+eng', '中英混合'], ['chi_sim', '简体中文'], ['eng', 'English']]

export function App() {
  const [project, setProject] = useState(null)
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('compare')
  const [zoom, setZoom] = useState(100)
  const [cropping, setCropping] = useState(false)
  const [busy, setBusy] = useState(null)
  const [status, setStatus] = useState(null)
  const [language, setLanguage] = useState('chi_sim+eng')
  const [dragOver, setDragOver] = useState(false)
  const [replaceId, setReplaceId] = useState(null)
  const fileInput = useRef()
  const replaceInput = useRef()
  const help = useRef()
  const lock = useRef(false)
  const userProject = useRef(false)

  useEffect(() => {
    let active = true
    makeDemo().then(demo => {
      if (!active || userProject.current) return
      setProject(current => current ?? demo)
      setSelected(current => current ?? 'demo-title')
    }).catch(() => {
      if (active && !userProject.current) setStatus({ text: '示例资源加载失败，可以直接导入截图。', error: true })
    })
    return () => { active = false }
  }, [])

  const update = (id, changes) => setProject(current => ({
    ...current, layers: current.layers.map(layer => layer.id === id ? fitGeometry({ ...layer, ...changes, source: 'manual' }, current) : layer),
  }))

  function add(layer) {
    setProject(current => ({ ...current, layers: [...current.layers, layer] }))
    setSelected(layer.id)
    if (view === 'source') setView('edit')
  }

  async function run(kind, work) {
    if (lock.current) return
    lock.current = true
    setBusy({ kind, text: { import: '读取图片', ocr: '准备识别', export: '生成 PowerPoint', crop: '截取图片' }[kind], progress: 0 })
    setStatus(null)
    try {
      await work()
    } catch (error) {
      setStatus({ text: error instanceof Error ? error.message : '操作失败，请重试。', error: true })
    } finally {
      lock.current = false
      setBusy(null)
    }
  }

  function loadFile(file) {
    if (!file) return
    return run('import', async () => {
      const image = await importImage(file)
      userProject.current = true
      setProject({ ...image, id: crypto.randomUUID(), fileName: file.name,
        name: file.name.replace(/\.[^.]+$/, ''), layers: [], demo: false })
      setSelected(null)
      setView('compare')
      setZoom(100)
      setCropping(false)
      setStatus({ text: '截图已导入，可以识别文字或手动添加图层。' })
    })
  }

  function detect() {
    return run('ocr', async () => {
      const { recognizeSlide } = await import('./ocr.js')
      const layers = await recognizeSlide(project, language, (text, progress) => setBusy({ kind: 'ocr', text, progress }))
      if (layers.length) {
        setProject(current => ({ ...current, layers: [...current.layers.filter(item => item.kind !== 'text' || item.source === 'manual'), ...layers] }))
        setSelected(layers[0].id)
        if (view === 'source') setView('compare')
        setStatus({ text: '识别到 ' + layers.length + ' 行文字，请对照原图校对。' })
      } else {
        setStatus({ text: '这次没有识别到文字。可以放大原图后重试，或手动添加文本框。' })
      }
    })
  }

  function useCrop(rect) {
    if (rect.width < 6 || rect.height < 6) {
      setStatus({ text: '请在原图上拖出一个更大的区域。', error: true })
      return
    }
    return run('crop', async () => {
      const layer = fitGeometry({ ...newLayer('image', project), ...rect, name: '截图选区' }, project)
      add({ ...layer, src: await cropImage(project.src, layer) })
      setCropping(false)
      setStatus({ text: '已添加独立图片图层。' })
    })
  }

  function toggleCrop() {
    if (!cropping && view === 'edit') setView('compare')
    setCropping(!cropping)
    setStatus(null)
  }

  function replace(file) {
    if (!file || !replaceId) return
    return run('import', async () => {
      const image = await importImage(file)
      update(replaceId, { src: image.src })
      setStatus({ text: '图片已替换，原图层位置和尺寸已保留。' })
    })
  }

  function download() {
    return run('export', async () => {
      const { exportSlide } = await import('./export.js')
      await exportSlide(project)
      setStatus({ text: 'PPTX 已导出。' })
    })
  }

  function chooseView(mode) {
    setView(mode)
    if (mode === 'edit') setCropping(false)
  }

  function remove(id) {
    setProject(current => ({ ...current, layers: current.layers.filter(layer => layer.id !== id) }))
    if (selected === id) setSelected(null)
  }

  const disabled = !project || Boolean(busy)
  const liveLayers = project?.layers.filter(layer => layer.visible) ?? []
  const totals = { text: 0, shape: 0, image: 0 }
  for (const layer of liveLayers) totals[layer.kind] += 1

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"><Layers3 size={21} strokeWidth={2.25} /></span>
          <span className="wordmark">Slideform<span>.</span></span>
          <span className="brand-divider" aria-hidden="true" />
          <span className="brand-caption">截图重建工作台</span>
        </div>
        <div className="top-actions">
          <button className="icon-btn mobile-help" aria-label="使用帮助" onClick={() => help.current.showModal()}><CircleHelp size={17}/></button>
          <a className="github-link" aria-label="GitHub 仓库" href={repo} target="_blank" rel="noreferrer"><CodeXml size={17} /> <span>GitHub</span></a>
          <button className="primary-button" disabled={disabled || liveLayers.length === 0} onClick={download}>
            {busy?.kind === 'export' ? <LoaderCircle className="spin" size={17} /> : <ArrowDownToLine size={17} />}
            导出 PPTX
          </button>
        </div>
      </header>

      <div className="workbench">
        <aside className="project-rail">
          <div className="rail-main">
            <div className="aside-heading"><span><FolderOpen size={17} /> 项目</span></div>
            <label className="project-name">
              <span className="sr-only">项目名称</span>
              <input disabled={!project || Boolean(busy)} value={project?.name ?? ''} placeholder="未命名项目"
                maxLength={80} onChange={e => setProject(current => ({ ...current, name: e.target.value }))} />
            </label>
            {project && <div className="project-tile">
              <div className="project-thumb"><img src={project.src} alt="" /><span className="mono">01</span></div>
              <div className="tile-caption"><strong>{project.demo ? '示例幻灯片' : '当前幻灯片'}</strong><span className="mono">{project.width} × {project.height}</span></div>
            </div>}
            <button className="import-button" type="button" disabled={Boolean(busy)} onClick={() => fileInput.current.click()}><Plus size={17} /> 导入截图</button>
            <span className="formats">PNG / JPG / WebP · 最大 20 MB</span>
          </div>
          <div className="rail-bottom">
            <div className="local-note">
              <ShieldCheck size={17} />
              <div><strong>浏览器本地处理</strong><span>截图和导出文件留在本机。</span></div>
            </div>
            <button className="help-button" onClick={() => help.current.showModal()}><CircleHelp size={16} /> 使用帮助</button>
          </div>
        </aside>

        <main className="workspace"
          onDragOver={e => { e.preventDefault(); if (!busy) setDragOver(true) }}
          onDragLeave={e => { if (!(e.relatedTarget instanceof Node) || !e.currentTarget.contains(e.relatedTarget)) setDragOver(false) }}
          onDrop={e => { e.preventDefault(); setDragOver(false); loadFile(e.dataTransfer.files[0]) }}>
          <div className="workspace-heading">
            <div>
              <div className="eyebrow"><span /> 编辑工作台</div>
              <h1>截图重建</h1>
              <p>对照原图还原布局，导出可编辑的 PowerPoint。</p>
            </div>
            <button className="soft-button header-import" disabled={Boolean(busy)} onClick={() => fileInput.current.click()}><Upload size={15} /> 导入截图</button>
          </div>

          <div className="workspace-body">
            <div className="toolbar">
              <div className="view-switch" aria-label="画布视图">
                {views.map(([mode, label]) =>
                  <button key={mode} aria-pressed={view === mode} onClick={() => chooseView(mode)}>
                    {mode === 'compare' && <Columns2 size={15} />}{label}
                  </button>)}
              </div>
              <div className="toolbar-right">
                <div className="zoom-control">
                  <button className="icon-btn" aria-label="缩小" title="缩小" disabled={zoom <= 60} onClick={() => setZoom(clamp(zoom - 20, 60, 160))}><Minus size={16} /></button>
                  <button className="zoom-value mono" aria-label="缩放重置为 100%" onClick={() => setZoom(100)}>{zoom}%</button>
                  <button className="icon-btn" aria-label="放大" title="放大" disabled={zoom >= 160} onClick={() => setZoom(clamp(zoom + 20, 60, 160))}><Plus size={16} /></button>
                </div>
              </div>
            </div>

            {project ? <div className={'canvases ' + (view === 'compare' ? 'split' : 'single')}>
              {view !== 'edit' && <Canvas key={project.id + 'source'} project={project} source zoom={zoom} crop={cropping && !busy} onCrop={useCrop} />}
              {view !== 'source' && <Canvas key={project.id + 'edit'} project={project} selected={selected} zoom={zoom} onSelect={setSelected} onMove={update} />}
            </div> : <button className="empty-import" onClick={() => fileInput.current.click()} disabled={Boolean(busy)}><FileImage size={26} /> 导入一张幻灯片截图</button>}

            <div className="action-strip">
              <div className="ocr-controls">
                <button className="scan-button" onClick={detect} disabled={disabled}>
                  {busy?.kind === 'ocr' ? <LoaderCircle size={16} className="spin" /> : <ScanLine size={16} />} 识别文字
                </button>
                <select aria-label="识别语言" value={language} disabled={Boolean(busy)} onChange={e => setLanguage(e.target.value)}>
                  {languages.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                </select>
              </div>
              <div className="manual-actions">
                <button className="soft-button" disabled={disabled} onClick={() => add(newLayer('text', project))}><Type size={15} /> 文字</button>
                <button className="soft-button" disabled={disabled} onClick={() => add(newLayer('shape', project))}><Square size={15} /> 矩形</button>
                <button className="soft-button" disabled={disabled} aria-pressed={cropping} onClick={toggleCrop}><Crop size={15} /> 截取图片</button>
              </div>
            </div>

            <div className={'status-line' + (status?.error ? ' status-error' : '')} role="status" aria-live="polite">
              {busy ? <>
                <LoaderCircle size={15} className="spin" /> <span>{busy.text}{busy.kind === 'ocr' && busy.progress > 0 ? ' · ' + Math.round(busy.progress * 100) + '%' : ''}</span>
              </> : cropping ? <><Crop size={15} /><span>{status?.error ? status.text : '在原始截图上拖选区域，生成独立图片。'}</span><button onClick={() => setCropping(false)}>取消</button></>
                : status ? <>{status.error ? <CircleHelp size={15} /> : <Check size={15} />}<span>{status.text}</span></>
                : <><span className="status-dot" /><span>{project ? '工作台就绪' : '准备工作台'}</span></>}
            </div>
            <div className="object-summary">
              <span><Type size={15} /> <strong>{totals.text}</strong> 文本框</span>
              <span><Square size={14} /> <strong>{totals.shape}</strong> 形状</span>
              <span><ImageIcon size={15} /> <strong>{totals.image}</strong> 图片</span>
            </div>
          </div>
          {dragOver && <div className="drop-overlay"><Upload size={28} /> 松开鼠标导入截图</div>}
        </main>

        <Inspector project={project} selected={selected} onSelect={setSelected} update={update} remove={remove}
          move={(id, direction) => setProject(current => ({ ...current, layers: moveLayer(current.layers, id, direction) }))}
          replace={id => { if (!busy) { setReplaceId(id); replaceInput.current.click() } }}
          setBackground={background => setProject(current => ({ ...current, background }))} />
      </div>

      <input type="file" hidden ref={fileInput} accept={fileTypes} onChange={e => { loadFile(e.target.files[0]); e.target.value = '' }} />
      <input type="file" hidden ref={replaceInput} accept={fileTypes} onChange={e => { replace(e.target.files[0]); e.target.value = '' }} />
      <dialog className="help-dialog" ref={help}>
        <div className="dialog-heading"><h2>使用 Slideform</h2><button className="icon-btn" aria-label="关闭帮助" onClick={() => help.current.close()}><X size={20} /></button></div>
        <ol>
          <li>导入一张 PNG、JPG 或 WebP 截图。</li>
          <li>点击「识别文字」，再对照原图修改内容和位置。首次识别会加载本地工作台的语言包。</li>
          <li>添加矩形，或在原图框选区域生成可替换的图片图层。</li>
          <li>导出并用 PowerPoint 打开。每个可见图层都对应独立对象。</li>
        </ol>
        <p>重新加载页面会打开示例项目，请在离开前导出。</p>
        <a className="soft-button" href={repo + '/tree/main/skills/ppt-screenshot-rebuild'} target="_blank" rel="noreferrer">查看 Codex 技能</a>
      </dialog>
    </div>
  )
}
