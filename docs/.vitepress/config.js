export default {
    title: '@hpcc-js/wasm',
    description: 'Just playing around.',
    base: '/hpcc-js-wasm/',
    themeConfig: {
        // logo: '/hpcc-icon.png'        ,
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
                    { text: 'Base91', link: '/classes/base91.Base91' },
                    { text: 'Expat', link: '/classes/expat.Expat' },
                    { text: 'Graphviz', link: '/classes/graphviz.Graphviz' },
                    { text: 'Zstd', link: '/classes/zstd.Zstd' },
                ]
            }

        ],
        editLink: {
            pattern: 'https://github.com/hpcc-systems/hpcc-js-wasm/edit/trunk/docs/:path',
            text: 'Edit this page on GitHub'
        },
        footer: {
            message: 'Released under the Apache-2.0 License.',
            copyright: 'Copyright © 2019-present hpccsystems.com'
        }
    }
}
