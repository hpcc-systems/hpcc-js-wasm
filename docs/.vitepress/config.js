export default {
    title: '@hpcc-js/wasm',
    description: 'HPCC Systems Wasm Libraries',
    base: '/hpcc-js-wasm/',
    srcExclude: ['**/tests/**'],

    themeConfig: {
        repo: "hpcc-systems/hpcc-js-wasm",
        docsDir: "docs",
        docsBranch: "trunk",
        editLink: {
            pattern: 'https://github.com/hpcc-systems/hpcc-js-wasm/edit/trunk/docs/:path',
            text: 'Edit this page on GitHub'
        },
        lastUpdated: "Last Updated",

        nav: [
            { text: 'Guide', link: '/getting-started' },
            { text: 'GitHub', link: 'https://github.com/hpcc-systems/hpcc-js-wasm' },
            { text: 'Changelog', link: 'https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/CHANGELOG.md' },
        ],
        sidebar: [
            {
                text: 'General',
                items: [
                    { text: 'Getting Started', link: '/getting-started' },
                ]
            },
            {
                text: 'WASM CLI',
                items: [
                    { text: 'Graphviz', link: '/graphviz-cli' },
                ]
            },
            {
                text: 'WASM API',
                items: [
                    { text: 'Base91', link: '/base91/src/base91/classes/Base91' },
                    { text: 'DuckDB', link: '/duckdb/src/duckdb/classes/DuckDB' },
                    { text: 'Expat', link: '/expat/src/expat/classes/Expat' },
                    { text: 'Graphviz', link: '/graphviz/src/graphviz/classes/Graphviz' },
                    { text: 'Llama', link: '/llama/src/llama/classes/Llama' },
                    { text: 'Zstd', link: '/zstd/src/zstd/classes/Zstd' },
                ]
            }

        ],
        footer: {
            message: 'Released under the Apache-2.0 License.',
            copyright: 'Copyright © 2019-present hpccsystems.com'
        }
    }
}
