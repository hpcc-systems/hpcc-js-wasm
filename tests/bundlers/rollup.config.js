import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'src/rollup-test.js',
    output: {
        file: 'dist/rollup-test.js',
        format: 'es',
        inlineDynamicImports: true
    },
    plugins: [
        nodeResolve({
            preferBuiltins: true
        }),
        commonjs()
    ],
    external: [
        // Keep Node.js built-ins external
        'fs',
        'path',
        'crypto',
        'util',
        'url',
        'worker_threads',
        // Keep problematic browser-only packages external to allow graceful runtime handling
        '@hpcc-js/wasm-duckdb',
        '@hpcc-js/wasm-llama'
    ]
};
