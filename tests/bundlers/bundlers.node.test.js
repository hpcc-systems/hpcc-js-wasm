import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

describe('Bundler Integration Tests', () => {
    beforeAll(() => {
        // Ensure dist directory exists
        if (!existsSync('dist')) {
            mkdirSync('dist');
        }
    });

    it('should bundle and run successfully with Webpack', async () => {
        // Build with webpack
        execSync('npm run build:webpack', { stdio: 'pipe' });

        // Run the bundled code
        const output = execSync('node dist/webpack-test.js', { encoding: 'utf-8' });

        expect(output).toContain('Testing with Webpack bundler...');
        expect(output).toContain('✓ Base91 test passed');
        expect(output).toContain('✓ Expat test passed');
        expect(output).toContain('✓ Graphviz test passed');
        expect(output).toMatch(/✓ DuckDB test passed|⚠ DuckDB test skipped/);
        expect(output).toContain('✓ Llama test passed');
        expect(output).toContain('✓ Zstd test passed');
        expect(output).toContain('🎉 All tests passed!');
    }, 120000);

    it('should bundle and run successfully with ESBuild', async () => {
        // Build with esbuild
        execSync('npm run build:esbuild', { stdio: 'pipe' });

        // Run the bundled code
        const output = execSync('node dist/esbuild-test.js', { encoding: 'utf-8' });

        expect(output).toContain('Testing with ESBuild bundler...');
        expect(output).toContain('✓ Base91 test passed');
        expect(output).toContain('✓ Expat test passed');
        expect(output).toContain('✓ Graphviz test passed');
        expect(output).toMatch(/✓ DuckDB test passed|⚠ DuckDB test skipped/);
        expect(output).toContain('✓ Llama test passed');
        expect(output).toContain('✓ Zstd test passed');
        expect(output).toContain('🎉 All tests passed!');
    }, 120000);

    it('should bundle and run successfully with Rollup', async () => {
        // Build with rollup
        execSync('npm run build:rollup', { stdio: 'pipe' });

        // Run the bundled code
        const output = execSync('node dist/rollup-test.js', { encoding: 'utf-8' });

        expect(output).toContain('Testing with Rollup bundler...');
        expect(output).toContain('✓ Base91 test passed');
        expect(output).toContain('✓ Expat test passed');
        expect(output).toContain('✓ Graphviz test passed');
        expect(output).toMatch(/✓ DuckDB test passed|⚠ DuckDB test skipped/);
        expect(output).toContain('✓ Llama test passed');
        expect(output).toContain('✓ Zstd test passed');
        expect(output).toContain('🎉 All tests passed!');
    }, 120000);
});
