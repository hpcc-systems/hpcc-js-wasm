module.exports = function (config) {
    config.set({
        frameworks: ['mocha', 'chai'],
        files: [
            'dist-test/index.js',
            { pattern: 'dist/*.wasm', watched: false, included: false, served: true },
        ],
        proxies: {
            "/dist/": "/base/dist/"
        },
        reporters: ['spec'],
        port: 9876,  // karma web server port
        colors: true,
        logLevel: config.LOG_INFO,
        browsers: ["Firefox", "ChromeHeadless"],
        autoWatch: false,
        concurrency: Infinity
    })
}