// [CONFIG:playwright]
// E2E-смоук сайта-витрины: статика поднимается http-server'ом,
// прогоняется один хром. Отчёты — в test-results/ (гитигнорится).
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['junit', { outputFile: 'test-results/e2e-junit.xml' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run serve',
    url: 'http://127.0.0.1:5173/index.html',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
// </CONFIG:playwright>
