# Bundler Integration Tests

# Bundler Integration Tests

This directory contains comprehensive bundler integration tests for the `@hpcc-js/wasm` packages. The tests verify that all packages work correctly with popular JavaScript bundlers in both Node.js and browser environments.

## Overview

The bundler integration tests ensure that all WASM packages are compatible with:
- **Bundlers**: webpack 5, esbuild, rollup.js
- **Environments**: Node.js and browsers (via Chromium/Playwright)
- **Packages Tested**: 6 packages
  - `@hpcc-js/wasm-base91` - Base91 encoding/decoding
  - `@hpcc-js/wasm-expat` - XML parsing
  - `@hpcc-js/wasm-zstd` - Zstandard compression
  - `@hpcc-js/wasm-graphviz` - Graph visualization
  - `@hpcc-js/wasm-llama` - Language model inference
  - `@hpcc-js/wasm-duckdb` - In-process SQL OLAP database

## Test Structure

```
tests/bundlers/
├── README.md                      # This file
├── package.json                   # Test project configuration
├── bundlers.node.test.js          # Node.js integration tests
├── bundlers.browser.test.js       # Browser integration tests
├── vitest.node.config.js          # Node.js test configuration
├── vitest.browser.config.js       # Browser test configuration
├── webpack.config.js              # Webpack configuration for Node.js
├── webpack.browser.config.js      # Webpack configuration for browsers
├── rollup.config.js              # Rollup configuration for Node.js
├── rollup.browser.config.js      # Rollup configuration for browsers
├── src/
│   ├── test-utils.js             # Node.js test utilities
│   └── browser-test-utils.js     # Browser test utilities
└── dist/                         # Generated bundles (created during tests)
```

## Running Tests

### All Tests
```bash
npm run test:all
```

### Node.js Only
```bash
npm run test:node
```

### Browser Only
```bash
npm run test:browser
```

### Individual Bundlers (Node.js)
```bash
npm run build:webpack && node dist/webpack-bundle.js
npm run build:esbuild && node dist/esbuild-bundle.js  
npm run build:rollup && node dist/rollup-bundle.js
```

### Individual Bundlers (Browser)
```bash
npm run build:webpack:browser    # Creates dist/webpack-browser-bundle.js
npm run build:esbuild:browser    # Creates dist/esbuild-browser-bundle.js
npm run build:rollup:browser     # Creates dist/rollup-browser-bundle.js
```

## Test Results

### Node.js Environment ✅
- **Webpack**: All 6 packages working (fallback for DuckDB/Llama if needed)
- **ESBuild**: All 6 packages working (fallback for DuckDB/Llama if needed)
- **Rollup**: All 6 packages working (external dependencies configuration)

### Browser Environment ✅
- **Webpack**: All 6 packages working including DuckDB with Worker support
- **ESBuild**: All 6 packages working including DuckDB with Worker support
- **Rollup**: All 6 packages working including DuckDB with Worker support

## Key Features

### Graceful Fallbacks
- DuckDB and Llama packages include graceful fallback handling for environments where they might not be fully supported
- Tests continue even if individual packages fail, providing comprehensive compatibility reports

### Cross-Platform Compatibility
- Node.js tests verify server-side bundling and execution
- Browser tests verify client-side bundling with actual WebAssembly execution in Chromium

### Comprehensive Package Testing
- Each package is tested with its core functionality:
  - **Base91**: Encoding and decoding operations
  - **Expat**: XML parsing with callbacks
  - **Zstd**: Compression and decompression
  - **Graphviz**: DOT graph rendering to SVG
  - **Llama**: Model loading and basic inference
  - **DuckDB**: SQL query execution with result validation

### Bundler-Specific Configurations
- **Webpack**: Proper externals and resolve configuration
- **ESBuild**: Platform and format targeting for both environments
- **Rollup**: External dependency handling with proper plugin configuration

## Technical Details

### Dependencies
- **Testing**: `vitest` with `@vitest/browser` for cross-platform testing
- **Browser Automation**: `playwright` with Chromium for browser tests
- **Build Tools**: `webpack`, `esbuild`, `rollup` with appropriate plugins

### Browser Testing Architecture
- Uses Vitest's browser runner with Playwright
- Tests run in actual Chromium browser environment
- WebAssembly modules loaded and executed in browser context
- Full validation of browser-specific APIs and Workers

### Special Considerations
- **DuckDB Browser**: Handles event-based result streaming in browser environment
- **External Dependencies**: Rollup configuration externalizes problematic dependencies
- **Timeout Handling**: Extended timeouts for WASM module loading and initialization
- **Memory Management**: Proper cleanup with `.unload()` calls after testing

## Maintenance

The tests are designed to be:
- **Automated**: Can be run in CI/CD pipelines
- **Comprehensive**: Cover both success and failure scenarios  
- **Maintainable**: Modular structure allows easy addition of new packages or bundlers
- **Informative**: Detailed logging and error reporting for debugging

This testing suite ensures that users can confidently use any of the `@hpcc-js/wasm` packages with their preferred bundler and deployment target.

## Tested Bundlers

- **Webpack 5** - Tests that packages can be bundled with webpack including WebAssembly support
- **ESBuild** - Tests that packages can be bundled with esbuild's fast bundling
- **Rollup.js** - Tests that packages work with rollup's ES module bundling

## Tested Packages

- `@hpcc-js/wasm-base91` - Base91 encoding/decoding
- `@hpcc-js/wasm-expat` - XML parsing with Expat
- `@hpcc-js/wasm-graphviz` - Graphviz DOT rendering
- `@hpcc-js/wasm-duckdb` - DuckDB in-process SQL OLAP database
- `@hpcc-js/wasm-llama` - Large Language Model inference  
- `@hpcc-js/wasm-zstd` - Zstandard compression

## Setup

From this directory, install dependencies:

```bash
npm install
```

## Running Tests

### Individual Bundler Tests

Test with a specific bundler:

```bash
npm run test:webpack
npm run test:esbuild  
npm run test:rollup
```

### All Bundler Tests

Test all bundlers at once:

```bash
npm run test:all-bundlers
```

### Vitest Integration Tests

Run the full integration test suite with vitest:

```bash
npm test
```

This will:
1. Bundle each test with its respective bundler
2. Execute the bundled code 
3. Verify that all WASM packages load and function correctly

## What These Tests Verify

For each bundler, the tests verify:

1. **Package Resolution** - That the bundler can correctly resolve the WASM packages
2. **WebAssembly Loading** - That WASM modules load correctly in the bundled environment
3. **Functionality** - That the core functionality of each package works after bundling:
   - **Base91**: Encode/decode binary data
   - **Expat**: Parse XML documents
   - **Graphviz**: Render DOT notation to SVG
   - **DuckDB**: Execute SQL queries
   - **Llama**: Load model and check version
   - **Zstd**: Compress/decompress binary data
4. **No Runtime Errors** - That there are no module loading or execution errors

## Test Output

Successful tests will show output like:

```
Testing with [Bundler] bundler...
✓ Base91 test passed
✓ Expat test passed
✓ Graphviz test passed  
✓ DuckDB test passed
✓ Llama test passed
✓ Zstd test passed

🎉 All tests passed!
```

## Troubleshooting

If tests fail:

1. Make sure the packages are built: `npm run build` from the root directory
2. Check that dependencies are installed: `npm install`
3. Look at the bundler-specific error messages for configuration issues
4. Verify WebAssembly files are properly included in the package distributions
