# Bundler Integration Tests

## Overview

This test suite verifies that the built `@hpcc-js/wasm-*` packages can be properly consumed by popular JavaScript bundlers. The tests ensure that WebAssembly modules load correctly and function as expected when bundled with different build tools.

## Architecture

```
tests/bundlers/
├── src/
│   ├── test-utils.js          # Shared test functions
│   ├── webpack-test.js        # Webpack entry point
│   ├── esbuild-test.js        # ESBuild entry point
│   └── rollup-test.js         # Rollup entry point
├── webpack.config.js          # Webpack configuration
├── rollup.config.js           # Rollup configuration
├── vitest.config.js           # Vitest test configuration
├── bundlers.test.js           # Main test suite
├── package.json               # Test dependencies
└── README.md                  # Documentation
```

## Tested Combinations

### Bundlers
- **Webpack 5** with WebAssembly async support
- **ESBuild** with Node.js target
- **Rollup.js** with ES module output

### Packages
- `@hpcc-js/wasm-base91` - Base91 encoding/decoding
- `@hpcc-js/wasm-expat` - XML parsing with Expat  
- `@hpcc-js/wasm-graphviz` - Graphviz DOT rendering
- `@hpcc-js/wasm-duckdb` - DuckDB in-process SQL OLAP database
- `@hpcc-js/wasm-llama` - Large Language Model inference
- `@hpcc-js/wasm-zstd` - Zstandard compression

## Running Tests

### From Root Directory

```bash
# Install all dependencies including bundler test deps
npm run install-build-deps

# Run all bundler tests via vitest
npm run test-bundlers

# Run bundler tests via shell script (more verbose)
npm run test-bundlers-script

# Run specific bundler tests
npm run test-bundlers-webpack
npm run test-bundlers-esbuild  
npm run test-bundlers-rollup

# Run all tests (regular + bundler)
npm run test-all
```

### From Bundlers Directory

```bash
cd tests/bundlers

# Install dependencies
npm install

# Run vitest integration tests
npm test

# Run specific bundler manually
npm run test:webpack
npm run test:esbuild
npm run test:rollup
```

## Test Process

For each bundler, the test:

1. **Bundles** the test code with the bundler's configuration
2. **Executes** the bundled output in Node.js
3. **Verifies** that each WASM package loads successfully
4. **Tests** core functionality of each package
5. **Confirms** no runtime errors occur

## What Gets Tested

### Package Loading
- Correct module resolution
- WebAssembly module loading
- Proper initialization sequencing

### Functionality
- **Base91**: Encode/decode string data
- **Expat**: Parse XML documents with callbacks
- **Graphviz**: Render DOT notation to SVG
- **DuckDB**: Execute SQL queries on in-memory database
- **Llama**: Load models and verify functionality
- **Zstd**: Compress/decompress binary data

### Integration Points
- ES module imports
- WebAssembly instantiation
- Async module initialization
- Cross-package compatibility

## Bundler Configurations

### Webpack
- WebAssembly async experiments enabled
- Node.js target for testing
- Built-in modules externalized
- WASM files handled as async modules

### ESBuild
- Node.js platform target
- Bundle mode enabled
- External Node.js modules

### Rollup
- ES module output format
- Node.js built-ins externalized
- Module resolution via plugins

## CI Integration

The tests are integrated into the GitHub Actions workflow (`test-pr.yml`) and run on:
- Ubuntu, macOS (Intel & ARM)
- Node.js versions 22, 24
- Every pull request and push

## Troubleshooting

### Common Issues

**WebAssembly Loading Errors**
- Ensure WASM files are included in package distributions
- Check bundler WebAssembly support is configured correctly

**Module Resolution Errors**  
- Verify workspace dependencies are properly linked
- Check that packages are built before running tests

**Timeout Errors**
- Bundling operations can be slow; tests have extended timeouts
- Large WebAssembly modules may need more time to initialize

### Debugging

Enable verbose output:
```bash
# Use the shell script for detailed output
npm run test-bundlers-script

# Or run bundlers individually
cd tests/bundlers
npm run test:webpack  # etc.
```

Check bundled output:
```bash
cd tests/bundlers
npm run build:webpack
node dist/webpack-test.js
```

## Future Enhancements

Potential areas for expansion:

- **More Bundlers**: Parcel, Vite, etc.
- **Browser Testing**: Test bundled code in browsers
- **Tree Shaking**: Verify unused code elimination  
- **Code Splitting**: Test dynamic imports and chunks
- **Different Targets**: Browser, Web Worker, Service Worker
- **Package Combinations**: Test using multiple packages together
