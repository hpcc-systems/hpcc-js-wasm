import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        name: 'bundler-integration-node',
        include: ['**/*.node.test.js'],
        environment: 'node',
        testTimeout: 120000, // Allow more time for bundling operations
        hookTimeout: 60000
    }
});
