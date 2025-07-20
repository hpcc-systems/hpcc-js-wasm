import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'src/rollup-browser-test.js',
    output: {
        file: 'dist/rollup-browser-test.js',
        format: 'es',
        inlineDynamicImports: true
    },
    plugins: [
        nodeResolve({
            browser: true,
            preferBuiltins: false
        }),
        commonjs()
    ]
};
