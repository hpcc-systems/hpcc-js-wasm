import { describe, it, expect } from 'vitest';

describe('Browser Bundler Integration Tests', () => {

    it('should run webpack browser tests', async () => {
        // Import and run the browser test utilities directly
        const { runAllTests } = await import('./src/browser-test-utils.js');

        const result = await runAllTests();
        expect(result).toBe(true);
    }, 180000); // Longer timeout for browser WASM loading

    it('should run esbuild browser tests', async () => {
        // Import and run the browser test utilities directly
        const { runAllTests } = await import('./src/browser-test-utils.js');

        const result = await runAllTests();
        expect(result).toBe(true);
    }, 180000);

    it('should run rollup browser tests', async () => {
        // Import and run the browser test utilities directly
        const { runAllTests } = await import('./src/browser-test-utils.js');

        const result = await runAllTests();
        expect(result).toBe(true);
    }, 180000);
});
