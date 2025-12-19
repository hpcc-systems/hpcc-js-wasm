# Copilot Instructions for HPCC-JS-WASM
*Last updated: December 2025 | For AI assistants working with hpcc-systems/hpcc-js-wasm*

This document provides guidance for AI assistants working with the HPCC-JS-WASM repository.

## Repository Overview

This is a **monorepo** that provides WebAssembly (WASM) versions of popular C++ libraries for use in Node.js, web browsers, and JavaScript applications. It uses **Lerna** for monorepo management and **npm workspaces**.

### Packages Provided

1. **@hpcc-js/wasm-base91** - Base91 encoding/decoding library
2. **@hpcc-js/wasm-duckdb** - DuckDB embedded database  
3. **@hpcc-js/wasm-expat** - Expat XML parser
4. **@hpcc-js/wasm-graphviz** - Graphviz graph visualization library
5. **@hpcc-js/wasm-graphviz-cli** - Command-line interface for Graphviz
6. **@hpcc-js/wasm-llama** - Llama.cpp AI model library
7. **@hpcc-js/wasm-zstd** - Zstandard compression library
8. **@hpcc-js/wasm** - Meta package for backward compatibility

## Architecture

### File Structure
```
├── packages/           # Individual WASM packages
│   ├── base91/        # Base91 package
│   ├── duckdb/        # DuckDB package  
│   ├── expat/         # Expat package
│   ├── graphviz/      # Graphviz package
│   ├── graphviz-cli/  # Graphviz CLI package
│   ├── llama/         # Llama package
│   ├── wasm/          # Meta package
│   └── zstd/          # Zstd package
├── src-cpp/           # Shared C++ source code
├── scripts/           # Build and utility scripts
├── docs/              # Documentation (VitePress)
└── .vscode/           # VSCode configuration
```

### Package Structure Pattern
Each package typically contains:
```
packages/[name]/
├── src/               # TypeScript source
├── src-cpp/           # C++ source code
├── tests/             # Test files
├── package.json       # Package configuration
└── vitest.config.ts   # Test configuration
```

## Development Workflow

### Prerequisites for Full Development
```bash
# Install dependencies
npm ci

# Install build dependencies (requires system tools)
npm run install-build-deps  # Installs emsdk, vcpkg, playwright, bundler test deps

# Build C++ to WASM (requires emscripten)
npm run build-cpp

# Build TypeScript packages
npm run build-ws
```

Notes:
- CI runs Node.js 22 and 24; docs deploy currently uses Node.js 20.
- Browser tests typically require `npx playwright install --with-deps` on Ubuntu.

### Quick Development (TypeScript only)
```bash
# Install dependencies
npm ci

# Build only TypeScript (without C++ compilation)
npm run build-ws

# Run linting
npm run lint

# Note: Tests may fail without WASM builds
```

### Testing
```bash
# Run all tests (requires full build)
npm run test

# Run specific package tests
cd packages/graphviz && npm test

# Run browser tests
npm run test-browser

# Run node tests  
npm run test-node
```

## Common Patterns

### WASM Library Loading Pattern
All WASM libraries follow this pattern:
```typescript
import { LibraryName } from "@hpcc-js/wasm-libraryname";

// Async loading required
const library = await LibraryName.load();

// Use library methods
const result = library.someMethod(input);
```

### Package Export Structure
```typescript
// src/index.ts - Main entry point
export * from "./libraryname.ts";

// src/libraryname.ts - Main implementation
export class LibraryName {
    static async load(): Promise<LibraryName> { ... }
    someMethod(input: string): string { ... }
    version(): string { ... }
}
```

### Testing Patterns
```typescript
import { describe, it, expect } from "vitest";
import { LibraryName } from "@hpcc-js/wasm-libraryname";

describe("LibraryName", () => {
    it("basic functionality", async () => {
        const lib = await LibraryName.load();
        const result = lib.someMethod("test");
        expect(result).toBeDefined();
    });
});
```

## Key Technologies

- **TypeScript** - Primary language for package implementations
- **C++** - Source libraries compiled to WASM
- **Emscripten** - C++ to WASM compilation toolchain
- **Lerna** - Monorepo management
- **Vitest** - Testing framework (with browser support)
- **ESBuild** - TypeScript bundling
- **VitePress** - Documentation generation

## Build System

### C++ Compilation Chain
1. **vcpkg** - C++ package manager for dependencies
2. **emscripten** - Compiles C++ to WASM
3. **IDL files** - WebIDL bindings for C++ classes
4. **Custom esbuild plugins** - Handle WASM imports

### TypeScript Build
1. **tsc** - Type generation
2. **esbuild** - Bundling (ESM, CJS, UMD formats)
3. **Custom plugins** - WASM asset handling

## Common Issues and Solutions

### Build Failures
- **Missing WASM files**: Run `npm run build-cpp` first
- **Type errors**: Ensure all packages are built with `npm run build-ws`
- **Test failures in fresh clone**: Expected - requires full build process

### Package Resolution Issues
- Packages depend on each other being built
- Use relative imports for local development
- Run `lerna run build` to build all packages

### WASM Loading Issues
- WASM files must be accessible at runtime
- Browser requires proper MIME types for .wasm files
- Node.js needs appropriate file system access

## Debugging

### VSCode Configuration
- Launch configurations provided for browser and Node.js debugging
- Tasks configured for watch mode development
- CMake integration for C++ development

### Log Levels
Most libraries support debug output:
```typescript
// Enable debug logging
const lib = await LibraryName.load({ debug: true });
```

## Documentation

- **API Docs**: Generated with TypeDoc at https://hpcc-systems.github.io/hpcc-js-wasm/
- **Examples**: See `/examples` directory and live demos in root:
  - `hw-graphviz.html` - Graphviz graph rendering
  - `hw-zstd.html` - Compression examples
  - `hw-base91.html` - Encoding demos
  - `index.html` - Package showcase
- **Package READMEs**: Each package has specific documentation

## AI Assistant Guidelines

### When Making Changes
1. **Understand the monorepo structure** - changes may affect multiple packages
2. **Follow existing patterns** - each package follows similar structure
3. **Test incrementally** - build and test after each significant change
4. **Consider WASM implications** - changes to C++ require full rebuild
5. **Update documentation** - maintain TypeDoc comments and READMEs

### Safe Operations (No Full Build Required)
- TypeScript code changes in `src/` directories
- Test file modifications
- Documentation updates
- Package.json script modifications

### Operations Requiring Full Build
- C++ source code changes in `src-cpp/` directories
- WebIDL (.idl) file changes
- CMakeLists.txt modifications
- New WASM library additions

### Before Submitting Changes
1. Run `npm run lint` to check code style
2. Run `npm run build-ws` to ensure TypeScript builds
3. If C++ was modified, run full build cycle
4. Test affected packages individually
5. Update relevant documentation