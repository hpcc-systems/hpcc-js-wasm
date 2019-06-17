module.exports = function (config) {
    config.set({
        frameworks: ['mocha', 'chai'],
        files: [
            'dist/index.js',
            { pattern: 'dist/*.wasm', watched: false, included: false, served: true },
            { pattern: 'dist/*.map', watched: false, included: false, served: true },
            'test/**/*.js'
        ],
        exclude: [
        ],
        preprocessors: {
            'dist/index.js': 'coverage'
        },
        reporters: ['coverage', 'coveralls'],
        port: 9876,  // karma web server port
        colors: true,
        logLevel: config.LOG_INFO,
        browsers: ['Chrome'], //, 'Firefox', 'FirefoxDeveloper', 'FirefoxNightly', 'IE'],
        autoWatch: true,
        concurrency: Infinity,
        coverageReporter: {
            type: 'lcov', // lcov or lcovonly are required for generating lcov.info files
            dir: 'coverage/'
        },
        customLaunchers: {
            FirefoxHeadless: {
                base: 'Firefox',
                flags: ['-headless'],
            }
        }
    })
}
