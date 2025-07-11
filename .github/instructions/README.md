# Instructions Summary
*AI Assistant instructions for hpcc-systems/hpcc-js-wasm - Updated July 2025*

This directory contains comprehensive instructions for AI assistants working with the HPCC-JS-WASM repository.

## File Overview

### Main Instructions
- **[main.md](main.md)** - Start here! Repository overview, architecture, and basic guidance
- **[workflow.md](workflow.md)** - Step-by-step development workflows for common tasks
- **[patterns.md](patterns.md)** - Quick reference for package patterns and usage examples
- **[troubleshooting.md](troubleshooting.md)** - Debugging guide for common issues

### Package-Specific Instructions
- **[../../packages/graphviz/.copilot-package.md](../../packages/graphviz/.copilot-package.md)** - Graphviz package specifics
- **[../../packages/duckdb/.copilot-package.md](../../packages/duckdb/.copilot-package.md)** - DuckDB package specifics

## Quick Start for AI Assistants

1. **First Time Setup**: Read [main.md](main.md) for repository overview
2. **Development Tasks**: Follow workflows in [workflow.md](workflow.md)
3. **Package Usage**: Check patterns in [patterns.md](patterns.md)
4. **Problems?**: Consult [troubleshooting.md](troubleshooting.md)

## Key Points for AI Assistants

- **Monorepo Structure**: 8 packages, each providing WASM versions of C++ libraries
- **Build Complexity**: Requires C++ compilation for full functionality
- **TypeScript First**: Many operations can be done with TypeScript-only builds
- **Test Expectations**: Fresh clone tests will fail without WASM builds (expected)
- **Safe Operations**: Documentation changes, TypeScript modifications don't need full build

## Most Common Scenarios

### Making TypeScript Changes
```bash
npm ci
npm run lint
npm run build-ws  # May fail without WASM, but can still work on TS
```

### Full Development Setup
```bash
npm ci
npm run install-build-deps  # Requires system tools
npm run build-cpp          # Compiles C++ to WASM
npm run build-ws           # Builds TypeScript
npm run test               # Full test suite
```

### Quick Fix Workflow
```bash
# Make changes
npm run lint
npm run lint-fix  # Auto-fix linting issues
# Test specific package if needed
cd packages/[package] && npm test
```

## Quick Commands Reference

| Task | Command |
|------|---------|
| TypeScript only | `npm ci && npm run build-ws` |
| Full build | `npm run install-build-deps && npm run build-cpp && npm run build-ws` |
| Lint and fix | `npm run lint-fix` |
| Test specific package | `cd packages/[name] && npm test` |
| Clean rebuild | `npm run clean && npm ci && npm run build-ws` |
| Browser tests only | `npm run test-browser` |
| Node tests only | `npm run test-node` |

## Live Examples in Repository

- **hw-graphviz.html** - Basic Graphviz graph rendering
- **hw-zstd.html** - Compression and decompression examples  
- **hw-base91.html** - Binary encoding/decoding demos
- **test.html** - Multi-package integration testing
- **index.html** - Package showcase and demos

## When to Escalate

- C++ compilation errors requiring emscripten expertise
- System dependency issues (cmake, python, etc.)
- Platform-specific problems (Windows, specific Linux distributions)
- Memory/performance issues beyond normal optimization

## Success Metrics

You've successfully used these instructions if:
- You understand the repository structure and build system
- You can make TypeScript changes safely
- You can diagnose and resolve common build/test failures
- You know when to attempt full builds vs. TypeScript-only changes
- You can help users with package-specific questions

---

*These instructions are designed to help AI assistants provide better support for the HPCC-JS-WASM repository. They should be updated as the repository evolves.*