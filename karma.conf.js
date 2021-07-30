module.exports = function (config) {
    config.set({
        frameworks: ['mocha', 'chai'],
        files: ['dist/test.js',
            { pattern: 'dist/*.wasm', watched: false, included: false, served: true },
        ],
        reporters: ['spec'],
        port: 9876,  // karma web server port
        colors: true,
        logLevel: config.LOG_INFO,
        browsers: ['ChromeHeadless'],

        autoWatch: false,
        concurrency: Infinity
    })
}