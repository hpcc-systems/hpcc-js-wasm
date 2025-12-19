# AI Assistant Troubleshooting Guide
*Debugging guide for common issues in hpcc-systems/hpcc-js-wasm*

This guide helps AI assistants diagnose and resolve common issues in the HPCC-JS-WASM repository.

## Quick Diagnosis Commands

### Check Repository State
```bash
# Basic health check
git status
npm ls --depth=0
ls -la packages/*/dist/ 2>/dev/null | wc -l  # Count built packages

# Check for common build artifacts
find . -name "*.wasm" -not -path "./node_modules/*" | head -5
find . -name "*.d.ts" -not -path "./node_modules/*" | head -5
```

### Environment Check
```bash
# Node.js and npm versions
node --version
npm --version

# Check if build tools are available
which emcc 2>/dev/null && echo "Emscripten available" || echo "Emscripten not found"
ls -d emsdk 2>/dev/null && echo "emsdk installed" || echo "emsdk not found"
ls -d vcpkg 2>/dev/null && echo "vcpkg installed" || echo "vcpkg not found"
```

## Common Error Patterns and Solutions

### 1. "Failed to resolve entry for package" Error

**Symptoms:**
```
Error: Failed to resolve entry for package "@hpcc-js/wasm-graphviz". 
The package may have incorrect main/module/exports specified in its package.json.
```

**Diagnosis:**
```bash
# Check if package is built
ls packages/graphviz/dist/
ls packages/graphviz/types/

# Check package.json exports
cat packages/graphviz/package.json | grep -A 10 '"exports"'
```

**Solutions:**
```bash
# Solution 1: Build the specific package
cd packages/graphviz
npm run build

# Solution 2: Build all packages
npm run build-ws

# Solution 3: Clean and rebuild
npm run clean
npm ci
npm run build-ws
```

### 2. "Executable doesn't exist" (Playwright/Browser Tests)

**Symptoms:**
```
Error: browserType.launch: Executable doesn't exist at /home/runner/.cache/ms-playwright/chromium_headless_shell-1179/chrome-linux/headless_shell
```

**Solutions:**
```bash
# Install Playwright browsers
npx playwright install

# Or with system dependencies
npx playwright install --with-deps

# Alternative: Skip browser tests
npm run test-node  # Run only Node.js tests
```

### 3. WASM Loading Failures

**Symptoms:**
```
Error: Module not found: *.wasm
TypeError: Cannot read properties of undefined (loading WASM)
```

**Diagnosis:**
```bash
# Check if WASM files exist
find build/ -name "*.wasm" 2>/dev/null
ls packages/*/src-cpp/*.wasm 2>/dev/null
```

**Solutions:**
```bash
# Solution 1: Build C++ to WASM
npm run build-cpp

# Solution 2: Use Docker build (if local tools missing)
npm run build-docker

# Solution 3: Check build dependencies
npm run install-build-deps
```

### 4. TypeScript Type Errors

**Symptoms:**
```
TS2307: Cannot find module '@hpcc-js/wasm-graphviz' or its corresponding type declarations
```

**Diagnosis:**
```bash
# Check if types are generated
ls packages/graphviz/types/
cat packages/graphviz/package.json | grep '"types"'
```

**Solutions:**
```bash
# Generate types for specific package
cd packages/graphviz
npm run gen-types

# Generate types for all packages
npm run build-ws

# Check TypeScript configuration
npx tsc --noEmit
```

### 5. Lerna/Workspace Issues

**Symptoms:**
```
lerna ERR! ENOPACKAGES No packages found
npm ERR! Missing script: "build"
```

**Diagnosis:**
```bash
# Check lerna configuration
cat lerna.json
cat package.json | grep -A 5 '"workspaces"'

# List packages lerna can see
npx lerna ls
```

**Solutions:**
```bash
# Reinstall dependencies
npm ci

# Bootstrap lerna
npx lerna bootstrap

# Clean and reinstall
npm run clean-all
npm ci
```

### 6. Memory Issues (Browser)

**Symptoms:**
```
RangeError: Maximum call stack size exceeded
Out of memory errors in browser
```

**Solutions:**
```bash
# Use smaller test datasets
# Reduce concurrent operations
# Test in Node.js instead of browser
npm run test-node

# Check memory usage patterns in code
grep -r "new Uint8Array" packages/*/src/
```

### 7. Import/Export Module Issues

**Symptoms:**
```
SyntaxError: Cannot use import statement outside a module
Module format mismatch errors
```

**Diagnosis:**
```bash
# Check module types in package.json
grep -r '"type"' packages/*/package.json
grep -r '"module"' packages/*/package.json

# Check built file formats
ls packages/*/dist/*.{js,cjs,mjs} 2>/dev/null
```

**Solutions:**
```bash
# Ensure proper build
npm run build-ws

# Check esbuild configuration
cat packages/*/esbuild.js 2>/dev/null | head -20
```

## Debugging Workflows

### For TypeScript-Only Issues
```bash
# 1. Check syntax
npx eslint packages/*/src/**/*.ts

# 2. Check types
npx tsc --noEmit

# 3. Build incrementally
cd packages/[problematic-package]
npm run gen-types
npm run bundle

# 4. Test specific package
npm test
```

### For WASM-Related Issues
```bash
# 1. Check C++ build tools
which emcc || echo "Need emscripten"
ls emsdk/ || echo "Need emsdk"

# 2. Try minimal C++ build
cd packages/base91  # Smallest package
npm run build

# 3. Check WASM loading
node --input-type=module -e "
import fs from 'node:fs';
const wasm = fs.readFileSync('build/packages/base91/src-cpp/base91lib.wasm');
console.log('WASM size:', wasm.length);
"
```

### For Test Failures
```bash
# 1. Run specific test file
cd packages/[package]
npx vitest run tests/[specific-test].spec.ts

# 2. Run with verbose output
npx vitest run --reporter=verbose

# 3. Run in different environments
npm run test-node    # Node.js only
npm run test-browser # Browser only

# 4. Check test configuration
cat vitest.config.ts
```

## Performance Troubleshooting

### Slow Builds
```bash
# Check what's taking time
time npm run build-cpp
time npm run build-ws

# Use watch modes for development
npm run build-watch &
npm run build-cpp-watch &
```

### Memory Usage
```bash
# Monitor memory during tests
top -p $(pgrep node)

# Use Node.js memory profiling
node --max-old-space-size=4096 node_modules/.bin/vitest
```

### Bundle Size Issues
```bash
# Check bundle sizes
ls -lh packages/*/dist/*.js

# Analyze bundle content
npx esbuild packages/[package]/src/index.ts --bundle --analyze
```

## Environment-Specific Issues

### Windows (WSL) Issues
```bash
# Check WSL integration
wsl --version
echo $WSL_DISTRO_NAME

# Use WSL for build scripts
npm run build-cpp:win32
```

### Docker Issues
```bash
# Check Docker setup
docker --version
docker images | grep hpcc-js-wasm

# Build in Docker
npm run build-docker-image
npm run build-docker-wasm
```

### CI/CD Issues
```bash
# Check GitHub Actions
cat .github/workflows/test-pr.yml

# Local CI simulation
act  # If nektos/act is available
```

## Recovery Procedures

### Complete Reset
```bash
# Nuclear option - start fresh
npm run uninstall-build-deps
npm run clean-all
npm ci
npm run install-build-deps
npm run build
```

### Partial Reset
```bash
# Reset specific package
cd packages/[package]
npm run clean
npm run build

# Reset build artifacts only
npm run clean-build
npm run build-ws
```

### Git Reset
```bash
# Undo local changes
git checkout -- .
git clean -fd

# Reset to last commit
git reset --hard HEAD
```

## Preventive Measures

### Before Making Changes
1. **Save current state**: `git stash`
2. **Check tests pass**: `npm run lint && npm run build-ws`
3. **Create branch**: `git checkout -b feature/my-changes`

### During Development
1. **Test incrementally**: Build and test after each change
2. **Watch for errors**: Use watch modes (`npm run build-watch`)
3. **Monitor memory**: Keep an eye on process memory usage

### Before Committing
1. **Full lint**: `npm run lint`
2. **Type check**: `npx tsc --noEmit`
3. **Test affected packages**: Focus on changed packages
4. **Clean build**: `npm run clean && npm run build-ws`

## When to Ask for Help

### Escalate if:
1. **System dependencies missing**: emscripten, cmake, etc.
2. **Platform-specific issues**: Windows, specific Linux distros
3. **Memory/performance issues**: Beyond normal optimization
4. **C++ compilation errors**: Deep WASM/emscripten issues
5. **Network/dependency issues**: npm, GitHub API problems

### Provide This Information:
```bash
# System info
uname -a
node --version
npm --version

# Repository state
git status
git log --oneline -3
npm ls --depth=0

# Error details
# Include full error messages and stack traces
# Include command that caused the error
# Include any recent changes made
```

## Quick Fixes Cheat Sheet

| Error | Quick Fix |
|-------|-----------|
| Package not found | `npm run build-ws` |
| WASM loading error | `npm run build-cpp` |
| Type errors | `cd packages/[pkg] && npm run gen-types` |
| Test failures | `npx playwright install` |
| Linting errors | `npm run lint-fix` |
| Memory issues | Use Node.js tests: `npm run test-node` |
| Import errors | Check package.json exports and rebuild |
| Docker issues | `npm run build-docker` |

Remember: Most issues in this repository stem from the complex build process. When in doubt, try a clean rebuild: `npm run clean && npm ci && npm run build-ws`