import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    mode: 'development',
    entry: './src/webpack-test.js',
    target: 'node',
    output: {
        filename: 'webpack-test.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        library: {
            type: 'module'
        }
    },
    resolve: {
        extensions: ['.js', '.wasm'],
        fallback: {
            "fs": false,
            "path": false,
            "crypto": false
        }
    },
    module: {
        rules: [
            {
                test: /\.wasm$/,
                type: 'webassembly/async'
            }
        ]
    },
    experiments: {
        asyncWebAssembly: true,
        outputModule: true
    },
    externals: {
        // Don't bundle Node.js modules
        'fs': 'node:fs',
        'path': 'node:path',
        'crypto': 'node:crypto',
        'util': 'node:util'
    }
};
