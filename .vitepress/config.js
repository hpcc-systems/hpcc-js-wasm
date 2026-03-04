import { resolve } from 'path';
import { defineConfig } from 'vite'

export default defineConfig({
    title: '@hpcc-js/wasm',
    description: 'HPCC Systems Wasm Libraries',
    base: '/hpcc-js-wasm/',
    srcExclude: ['build/', 'cmake/', 'docker/', 'emsdk/', 'vcpkg/', 'vcpkg-overlays/', '**/tests/**'],
    ignoreDeadLinks: true,

    themeConfig: {
        repo: "hpcc-systems/hpcc-js-wasm",
        docsDir: ".",
        docsBranch: "main",
        editLink: {
            pattern: 'https://github.com/hpcc-systems/hpcc-js-wasm/edit/main/docs/:path',
            text: 'Edit this page on GitHub'
        },
        lastUpdated: "Last Updated",

        nav: [
            { text: 'Guide', link: './docs/getting-started' },
            { text: 'GitHub', link: 'https://github.com/hpcc-systems/hpcc-js-wasm' },
            { text: 'Changelog', link: 'https://github.com/hpcc-systems/hpcc-js-wasm/blob/main/CHANGELOG.md' },
        ],
        sidebar: [
            {
                text: 'General',
                items: [
                    { text: 'Getting Started', link: '/docs/getting-started' },
                ]
            },
            {
                text: 'WASM CLI',
                items: [
                    { text: 'Graphviz', link: '/docs/graphviz-cli' },
                ]
            },
            {
                text: 'WASM API',
                items: [
                    { text: 'Base91', link: '/packages/base91/README' },
                    { text: 'DuckDB', link: '/packages/duckdb/README' },
                    { text: 'Expat', link: '/packages/expat/README' },
                    { text: 'Graphviz', link: '/packages/graphviz/README' },
                    { text: 'Llama', link: '/packages/llama/README' },
                    { text: 'Zstd', link: '/packages/zstd/README' },
                ]
            }

        ],
        footer: {
            message: 'Released under the Apache-2.0 License.',
            copyright: 'Copyright © 2019-present hpccsystems.com'
        }
    }
});
