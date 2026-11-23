import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import JSZip from 'jszip'

async function exportXml(page, testInfo) {
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出 PPTX' }).click()
  const download = await downloadEvent
  const filePath = testInfo.outputPath(download.suggestedFilename())
  await download.saveAs(filePath)
  const zip = await JSZip.loadAsync(await readFile(filePath))
  return zip.file('ppt/slides/slide1.xml').async('string')
}

test('edits the example and exports native PowerPoint objects', async ({ page }, testInfo) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  const original = page.getByRole('region', { name: '原始截图' })
  const rebuilt = page.getByRole('region', { name: '重建画布' })
  await expect(original.getByAltText('原始截图')).toBeVisible()
  await expect(rebuilt.getByRole('button', { name: '主标题', exact: true })).toHaveText('野性之上')
  await page.screenshot({ path: testInfo.outputPath('desktop.png') })

  await page.getByLabel('文字内容').fill('编辑后标题')
  await expect(rebuilt.getByRole('button', { name: '主标题', exact: true })).toHaveText('编辑后标题')
  const picture = rebuilt.getByRole('button', { name: '高山主图', exact: true })
  await picture.click()
  await expect(page.getByRole('button', { name: '替换图片' })).toBeVisible()
  const photoX = await page.getByLabel('X', { exact: true }).inputValue()
  const replacementDialog = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: '替换图片' }).click()
  await (await replacementDialog).setFiles('public/alpine-editorial.webp')
  await expect(page.getByRole('status')).toContainText('图片已替换')
  await expect(page.getByLabel('X', { exact: true })).toHaveValue(photoX)
  await page.getByRole('button', { name: '隐藏 页脚注记' }).click()

  const xml = await exportXml(page, testInfo)
  expect(xml).toContain('<a:t>编辑后标题</a:t>')
  expect(xml).toContain('name="主标题"')
  expect(xml).toContain('<a:prstGeom prst="rect"')
  expect(xml).toContain('<p:pic>')
  expect(xml).toContain('name="高山主图"')
  expect(xml).not.toContain('46° 51')
  expect(errors).toEqual([])
})

test('imports a screenshot, runs real OCR, and exports a cropped picture', async ({ page }, testInfo) => {
  const external = []
  page.on('request', request => {
    if (/^https?:/.test(request.url()) && !request.url().startsWith('http://127.0.0.1:4178/')) external.push(request.url())
  })
  await page.goto('/')
  await page.locator('input[type=file]').first().setInputFiles('tests/fixtures/ocr-bilingual.png')
  await expect(page.getByRole('status')).toContainText('截图已导入')
  await page.getByRole('button', { name: '识别文字' }).click()
  await expect(page.getByRole('status')).toContainText('识别到', { timeout: 65000 })
  const rebuilt = page.getByRole('region', { name: '重建画布' })
  await expect(rebuilt.getByRole('button', { name: 'SLIDEFORM OCR' })).toBeVisible()
  await expect(rebuilt.getByRole('button', { name: '幻灯片文字编辑' })).toBeVisible()

  await page.getByRole('button', { name: '截取图片' }).click()
  const area = await page.getByRole('region', { name: '原始截图' }).getByAltText('原始截图').boundingBox()
  await page.mouse.move(area.x + area.width * 0.53, area.y + area.height * 0.59)
  await page.mouse.down()
  await page.mouse.move(area.x + area.width * 0.77, area.y + area.height * 0.84, { steps: 8 })
  await page.mouse.up()
  await expect(rebuilt.getByRole('button', { name: '截图选区' })).toBeVisible()
  const xml = await exportXml(page, testInfo)
  expect(xml).toContain('<a:t>SLIDEFORM OCR</a:t>')
  expect(xml).toContain('<a:t>幻灯片文字编辑</a:t>')
  expect(xml).toContain('name="截图选区"')
  expect(external).toEqual([])
})

test('keeps the editor within a narrow viewport', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '截图重建' })).toBeVisible()
  await expect(page.getByRole('region', { name: '重建画布' })).toBeVisible()
  await expect(page.getByRole('button', { name: '导出 PPTX' })).toBeEnabled()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
  await page.screenshot({ path: testInfo.outputPath('mobile.png'), fullPage: true })
})
