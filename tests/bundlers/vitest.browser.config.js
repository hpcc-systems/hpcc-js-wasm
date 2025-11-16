import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        name: 'bundler-integration-browser',
        include: ['**/*.browser.test.js'],
        browser: {
            enabled: true,
            name: 'chromium',
            provider: playwright(),
            headless: true,
            screenshotFailures: false,
            instances: [
                {
                    browser: 'chromium',
                    headless: true,
                    screenshotFailures: false
                }
            ]
        },
        testTimeout: 120000, // Allow more time for bundling and WASM loading
        hookTimeout: 60000
    }
});
