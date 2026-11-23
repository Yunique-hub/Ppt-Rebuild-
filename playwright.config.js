import { defineConfig } from '@playwright/test'

const url = 'http://127.0.0.1:4178'

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.browser.js',
  timeout: 90000,
  expect: { timeout: 10000 },
  use: {
    baseURL: url,
    channel: process.env.SLIDEFORM_BROWSER_CHANNEL || undefined,
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4178 --strictPort',
    url,
    reuseExistingServer: !process.env.CI,
  },
})
