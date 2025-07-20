import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        name: 'bundler-integration',
        include: ['**/*.test.js'],
        environment: 'node',
        testTimeout: 60000, // Allow more time for bundling operations
        hookTimeout: 60000
    }
});
