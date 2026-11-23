# 架构说明

| 目录或模块 | 职责 |
| --- | --- |
| `skills/ppt-screenshot-rebuild/` | 独立的 Codex 技能入口和两份参考资料。版本随仓库维护，可单独安装。 |
| `src/App.jsx`、`Canvas.jsx`、`Inspector.jsx` | 协调导入、视图、图层操作和应用状态。 |
| `src/slide.js` | 统一截图坐标、图层几何、叠放顺序与 OCR 结果的转换。 |
| `src/images.js`、`ocr.js` | 解码图片、框选裁切和浏览器 OCR。 |
| `src/export.js` | 用相同坐标生成 PPTX，保留原生文本、矩形和独立图片对象。 |
| `public/` | 演示素材、品牌图标以及构建时准备的 OCR 静态资源。 |

## 数据流

上传的单页截图保存在应用内存，截图尺寸作为统一坐标系。OCR 生成文本框，框选生成图片图层，手动操作会更新同一组图层。画布按像素比例渲染，导出模块将像素坐标换算为 PowerPoint 版面尺寸。层叠顺序与命名会传递到输出文件，隐藏图层跳过导出。

OCR 与 PPTX 模块按需加载。Tesseract WebAssembly 与英语、简体中文语言包由锁定的 npm 依赖生成静态文件。前端无需服务端密钥、数据库或文件上传接口。示例照片由 OpenAI ImageGen 生成。Tesseract 引擎与语言数据来自 [Tesseract.js](https://github.com/naptha/tesseract.js) 和 [Tesseract tessdata](https://github.com/tesseract-ocr/tessdata_best)，采用 Apache-2.0。

## 验收与变更管理

- 图层数据变化先验证坐标约束与导出结果。
- 修改 OCR 时使用确定的高对比度中英测试截图，检查识别文字和坐标映射。
- 修改图片替换或导出时验证原有图层定位与 PPTX 原生对象。需要严格排版时，在 PowerPoint 中打开并渲染比较。
- GitHub Actions 运行单元、生产构建和 Chromium 浏览器测试。

## 示例图片

使用内置 OpenAI ImageGen 生成。工作台使用的压缩版本位于 [public/alpine-editorial.webp](../public/alpine-editorial.webp)。

> Generate one photorealistic landscape photograph for the hero region of an editorial PowerPoint sample in a premium Chinese slide-reconstruction editor. Wide horizontal 3:2 composition, dramatic Swiss Dolomites-like high alpine jagged mountains with one prominent pyramidal summit in the mid-right, textured charcoal blue rock and thin off-white snow trails, a dark rocky foreground valley and subtle clouds. Morning cold daylight, restrained slate blue/cyan muted color grading, crisp photographic texture, authentic high-end outdoor magazine editorial style. Frame the summit near the upper middle and leave space around edges for crop. No people, no text, no graphic overlays, no frames, no logo, no watermark.
