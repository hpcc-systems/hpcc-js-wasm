export const browser = {
    test: {
        name: 'browser',
        include: [
            '**/*.spec.{ts,js}'
        ],
        exclude: [
            '**/*.node.spec.{ts,js}',
            "**/node_modules/**",
            "**/emsdk/**"
        ],
        browser: {
            provider: "playwright",
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
