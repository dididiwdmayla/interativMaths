import { defineConfig, devices } from "@playwright/test";

/**
 * Um percurso de navegador, no tamanho de celular com toque, contra o build de produção.
 * O Chromium do ambiente fica em PLAYWRIGHT_BROWSERS_PATH (não baixe outro).
 */
const PORTA = 3200;

export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORTA}`,
    ...devices["Pixel 7"],
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npx next start -p ${PORTA}`,
    url: `http://localhost:${PORTA}`,
    timeout: 120_000,
    reuseExistingServer: true,
  },
});
