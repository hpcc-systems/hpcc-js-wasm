import { playwright } from "@vitest/browser-playwright";

const isCI = !!process.env.CI;
const testTimeout = isCI ? 180_000 : 60_000;
const hookTimeout = isCI ? 120_000 : 60_000;

export const browser = {
    test: {
        name: 'browser',
        testTimeout,
        hookTimeout,
        include: [
            '**/*.spec.{ts,js}'
        ],
        exclude: [
            '**/*.node.spec.{ts,js}',
            "**/node_modules/**",
            "**/emsdk/**"
        ],
        browser: {
            provider: playwright(),
            enabled: true,
            headless: process.env.HEADLESS !== 'false',
            instances: [
                { browser: 'chromium' },

            ],

        },
        server: {
            deps: {
                external: ["*"],
            }
        }
    }
};

export const node = {
    test: {
        name: 'node',
        testTimeout,
        hookTimeout,
        include: [
            '**/*.spec.{ts,js}'
        ],
        exclude: [
            '**/*.browser.spec.{ts,js}',
            "**/node_modules/**",
            "**/emsdk/**"
        ],
        environment: 'node',
        server: {
            deps: {
                external: ["*"],
            }
        }
    }
};
