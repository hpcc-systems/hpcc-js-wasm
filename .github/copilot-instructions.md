# HPCC-JS-WASM Copilot Instructions

**ALWAYS follow these instructions first**. Only fallback to additional search and context gathering if the information here is incomplete or found to be in error.

## Repository Overview

This is a WebAssembly (WASM) monorepo providing JavaScript/TypeScript bindings for C++ libraries:
- @hpcc-js/wasm-base91 - Base91 encoding/decoding
- @hpcc-js/wasm-duckdb - DuckDB embedded database
- @hpcc-js/wasm-expat - Expat XML parser
- @hpcc-js/wasm-graphviz - Graphviz graph visualization
- @hpcc-js/wasm-graphviz-cli - Graphviz CLI tool
- @hpcc-js/wasm-llama - Llama.cpp AI models
- @hpcc-js/wasm-zstd - Zstandard compression
- @hpcc-js/wasm - Meta package for backward compatibility

## Critical Build Requirements

**NEVER CANCEL BUILD COMMANDS** - Full builds can take 45+ minutes. ALWAYS set timeouts to 60+ minutes for any build command.

### Initial Setup Commands
```bash
# 1. Install dependencies (2-3 minutes)
npm ci

# 2. Install build dependencies (20-30 minutes - NEVER CANCEL)
# Includes: emsdk install (~5 min), vcpkg install (~15-20 min), playwright (~5-10 min), bundler test deps
npm run install-build-deps

# 3. Build C++ to WASM (30-45 minutes - NEVER CANCEL) 
# CRITICAL: Set timeout to 3600+ seconds (60+ minutes)
npm run build-cpp

# 4. Build TypeScript packages (5-10 minutes)
npm run build-ws

# 5. Full build command equivalent to build-cpp + build-ws (45+ minutes total - NEVER CANCEL)
# Equivalent to: build-cpp && build-ws
npm run build
```

### Measured Timing Examples
From actual runs in clean environment:
- `npm ci`: 44 seconds
- `npm run lint`: 1-2 minutes (after TypeScript build)
- `npm run install-emsdk`: 5-10 minutes (downloading + setup)
- `npm run install-vcpkg`: 15-25 minutes (depends on network)
- `npx playwright install`: 10-20 minutes (browser downloads)
- `npm run build-cpp`: 30-60 minutes (C++ compilation to WASM)
- `npm run test`: 15-30 minutes (includes browser and node tests)

## CMake / C++ (WASM) Build

Prefer the npm scripts. They source `./emsdk/emsdk_env.sh` and use the repo's CMake preset(s):

```bash
npm run build-cpp
```

For fast iteration:

```bash
npm run build-cpp-watch
```

### Quick Development (TypeScript Only)
```bash
# For TypeScript-only changes when WASM files exist
npm ci                  # 2-3 minutes
npm run build-ws        # 5-10 minutes
npm run lint           # 2-3 minutes
```

### Manual CMake (only when needed)

Manual CMake is supported, but you must source Emscripten first:

```bash
source ./emsdk/emsdk_env.sh
cmake -S . -B ./build --preset vcpkg-emscripten-MinSizeRel
cmake --build ./build --parallel
```

## Embind (C++ <-> JS Interop)

This repo uses Emscripten Embind to expose C++ APIs to JavaScript/TypeScript.

Reference: https://emscripten.org/docs/porting/connecting_cpp_and_javascript/embind.html

### Guidelines
- Prefer Embind over ad-hoc JS glue when exposing C++ to JS.
- Avoid throwing across the WASM boundary; catch exceptions in C++ and translate into explicit error results.
- Be explicit about ownership/lifetime:
  - If you return raw pointers (often created with `new`) via Embind, JS must eventually free them (e.g. via the generated `.delete()` method or `Module.destroy(obj)` depending on how the wrapper is used).
  - If practical, bind smart pointers (e.g. `std::unique_ptr` / `std::shared_ptr`) to make ownership explicit.
- For JS values, prefer `emscripten::val` and convert at the boundary (e.g. arrays -> `val.isArray()` + `val["length"]`). Validate types and reject non-finite numbers.
- Keep interop-friendly result types: materialize streaming results where needed for JS access patterns.

### Common Patterns Used Here
- `EMSCRIPTEN_BINDINGS(...)` with `emscripten::class_<T>` and `.function(...)`.
- `allow_raw_pointers()` is used for functions that accept/return pointer types.
- Provide small helper conversions (JS `val` -> C++ types) and centralize error messages for predictable JS behavior.

## Working Without Full Build

### What Works with npm ci + npm run lint Only
- Code style checking and linting
- TypeScript type checking (tsc --noEmit)
- Documentation viewing and editing
- Package.json script modification
- Configuration file changes

### What Requires npm run build-ws
- TypeScript compilation to JavaScript
- Package distribution files (dist/ directories)
- Import/export resolution testing
- ESLint with compiled output

### What Requires Full WASM Build (npm run build-cpp + build-ws)
- Running any package functionality
- All tests (browser and node)
- Bundle testing (webpack, rollup, esbuild)
- Actual library usage and validation
- Performance testing

**WARNING**: TypeScript-only builds WILL FAIL if WASM files don't exist. You'll see errors like:
```
✘ [ERROR] Could not resolve "../../../build/packages/base91/src-cpp/base91lib.wasm"
✘ [ERROR] Could not resolve "../../../build/packages/graphviz/src-cpp/graphvizlib.wasm"
```

## Testing

### Prerequisites
```bash
# Install playwright browsers (10-15 minutes - NEVER CANCEL)
npx playwright install --with-deps
```

### Test Commands
```bash
# Run all tests (15-20 minutes - NEVER CANCEL)
npm run test

# Run specific package tests
cd packages/graphviz && npm test

# Run browser tests only (10-15 minutes)
npm run test-browser

# Run node tests only (5-10 minutes) 
npm run test-node

# Run bundler integration tests (5-10 minutes)
npm run test-bundlers
```

**CRITICAL**: Tests require full build completion. Without WASM files, all tests will fail with module not found errors.

## Validation Scenarios

After making changes, ALWAYS run these validation scenarios:

### 1. Build Validation
```bash
npm run lint              # Must pass before committing
npm run build-ws          # TypeScript compilation
```

### 2. Package-Specific Validation
For Graphviz changes:
```bash
cd packages/graphviz
npm run build
npm test
# Test DOT rendering: echo 'digraph G { Hello -> World }' | npx graphviz-cli
```

For DuckDB changes:
```bash
cd packages/duckdb  
npm run build
npm test
# Test SQL query functionality
```

### 3. End-to-End Validation
```bash
# Test the examples in the root directory
node --input-type=module -e "
import { Graphviz } from './packages/graphviz/dist/index.js';
const g = await Graphviz.load();
console.log(g.version());
"
```

## Known Limitations and Workarounds

### Build Environment Issues
- **Network restrictions**: Downloads may fail in restricted environments
- **Docker alternative**: Use `npm run build-docker` if local builds fail
- **SSL certificate issues**: May block package downloads
- **Node.js version**: CI runs Node.js 22 and 24 (primary support); docs deploy currently uses Node.js 20

### Package-Specific Notes

#### Other Packages (base91, expat, graphviz, llama, zstd)
- **Require C++ compilation**: Must run `npm run build-cpp` first
- **WASM dependencies**: TypeScript builds fail without WASM files
- **Build location**: WASM files generated in `build/packages/*/src-cpp/`

### Test Environment Setup
```bash
# Required for browser tests
npx playwright install --with-deps

# Alternative for CI environments
npx playwright install
```

## File Structure Reference

```
├── packages/                 # Individual WASM packages
│   ├── base91/
│   │   ├── src/             # TypeScript source
│   │   ├── src-cpp/         # C++ source
│   │   ├── tests/           # Test files
│   │   └── package.json
│   ├── graphviz/            # Similar structure
│   └── ...
├── build/                   # Generated WASM files
│   └── packages/
│       └── */src-cpp/*.wasm
├── scripts/                 # Build automation
│   ├── cpp-build.sh
│   ├── cpp-install-emsdk.sh
│   └── cpp-install-vcpkg.sh
├── .github/
│   ├── workflows/           # CI pipelines
│   └── instructions/        # Additional documentation
├── emsdk/                   # Emscripten SDK (generated)
├── vcpkg/                   # C++ package manager (generated)
└── node_modules/            # npm dependencies
```

## Common Commands Reference

### Maintenance
```bash
npm run clean-all           # Clean all build artifacts
npm run update              # Update dependencies
npm run lint-fix            # Auto-fix linting issues
```

### Documentation
```bash
npm run gen-docs            # Generate TypeDoc documentation
npm run build-docs          # Build VitePress documentation
```

### Advanced Build Options
```bash
npm run build-cpp-watch     # Watch C++ files for changes
npm run build-watch      # Watch TypeScript files
npm run build-dev           # Development builds
```

## CI/Build Pipeline Notes

The `.github/workflows/test-pr.yml` pipeline runs:
1. `npm ci` (3-5 minutes)
2. `npm run install-build-deps` (20-30 minutes)
3. `npm run lint` (2-3 minutes)  
4. `npm run build` (30-45 minutes)
5. `npm run test` (15-20 minutes)
6. `npm run test-bundlers` (5-10 minutes)

**Total CI time: 75-110 minutes** - This is NORMAL and expected.

## Debugging Build Issues

### WASM File Missing Errors
```
✘ [ERROR] Could not resolve "../../../build/packages/base91/src-cpp/base91lib.wasm"
```
**Solution**: Run `npm run build-cpp` to generate WASM files.

### Emscripten Not Found
```
CMake Error: Emscripten.cmake toolchain file not found
Call Stack (most recent call first):
  buildtrees/0.vcpkg_dep_info.cmake:41 (vcpkg_triplet_file)
```
**Solution**: 
1. Run `npm run install-emsdk`
2. Source environment: `source ./emsdk/emsdk_env.sh`
3. Retry vcpkg install

### Emscripten Download Failures
```
Error: Downloading URL 'https://storage.googleapis.com/webassembly/emscripten-releases-builds/deps/node-v22.16.0-linux-x64.tar.xz': HTTP Error 403: Forbidden
```
**Solution**: Network restrictions may prevent downloads. Try:
1. Use Docker build: `npm run build-docker`
2. Or manually download and install Emscripten SDK

### Playwright Browser Missing
```
browserType.launch: Executable doesn't exist at /home/runner/.cache/ms-playwright/chromium_headless_shell-1181/chrome-linux/headless_shell
```
**Solution**: Run `npx playwright install --with-deps`

### Playwright Download Failures
```
Error: Download failed: size mismatch, file size: 180888452, expected size: 0
```
**Solution**: Network/proxy issues. Try:
1. `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci`
2. Manually install browsers later
3. Skip browser tests if not needed

### Module Not Found in Tests
```
Cannot find module '@hpcc-js/wasm-graphviz'
✗ Base91 test failed: Cannot find module '@hpcc-js/wasm-base91'
```
**Solution**: Build packages first with `npm run build-ws`

### Bundle Test Failures
```
ERROR: "bundle" exited with 1.
[!] (plugin commonjs--resolver) Error: Could not load /packages/base91/dist/index.js: ENOENT: no such file or directory
```
**Solution**: Complete full build cycle before running bundle tests.

## Development Workflow Summary

For new contributors:
1. **Fresh clone**: `git clone && cd hpcc-js-wasm`
2. **Dependencies**: `npm ci` (3 minutes)
3. **Build tools**: `npm run install-build-deps` (30 minutes, NEVER CANCEL)
4. **Full build**: `npm run build` (45 minutes, NEVER CANCEL) 
5. **Validation**: `npm run test` (20 minutes, NEVER CANCEL)

For routine development:
1. **TypeScript changes**: `npm run build-ws && npm run lint`
2. **C++ changes**: `npm run build-cpp && npm run build-ws` (45+ minutes)
3. **Before commit**: `npm run lint` (required for CI)
4. **Full validation**: `npm run test` (when ready for PR)

**Remember**: Set timeouts appropriately and NEVER CANCEL long-running build operations.