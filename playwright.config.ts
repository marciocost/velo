import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

export default defineConfig({

  // Tempo máximo para cada teste completo
  timeout: 60_000,

  // Tempo máximo para assertions como toBeVisible() e toHaveText()
  expect: {
    timeout: 5_000
  },

  testDir: './playwright/e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. */
  reporter: 'html',

  use: {
    /*
     * No CI usa a BASE_URL recebida do deploy Preview da Vercel.
     * Localmente usa o servidor Vite.
     */
    baseURL: process.env.BASE_URL || 'http://localhost:5173',

    /* Collect trace for test execution */
    trace: 'on',

    // Tempo máximo para ações interativas como click() e fill()
    actionTimeout: 5_000,

    // Tempo máximo para navegações como goto() e waitForURL()
    navigationTimeout: 10_000
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /*
   * O servidor local é iniciado apenas fora do CI.
   * No GitHub Actions, os testes usam diretamente a URL Preview da Vercel.
   */
  webServer: process.env.CI
    ? undefined
    : {
      command: 'yarn dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
    },
})
