# AI Assistant Development Workflow
*Step-by-step workflows for hpcc-systems/hpcc-js-wasm development*

This guide provides step-by-step workflows for common development tasks when working with the HPCC-JS-WASM repository.

## Initial Setup and Assessment

### 1. Fresh Repository Assessment
```bash
# Check repository state
git status
git log --oneline -5

# Check if dependencies are installed
ls node_modules/ || echo "Dependencies not installed"

# Check if packages are built
ls packages/*/dist/ || echo "Packages not built"

# Install dependencies if needed
npm ci
```

### 2. Quick Health Check
```bash
# Test linting (should work without builds)
npm run lint

# Try building TypeScript only (may fail without WASM)
npm run build-ws

# Check individual package status
cd packages/graphviz && npm run gen-types
```

## Development Workflows

### Workflow 1: TypeScript-Only Changes
For changes to TypeScript code, tests, or documentation:

```bash
# 1. Install dependencies
npm ci

# 2. Build TypeScript packages
npm run build-ws

# 3. Run linting
npm run lint

# 4. Test specific package
cd packages/[package-name]
npm test

# 5. Fix any linting issues
npm run lint-fix
```

### Workflow 2: Full Development Setup
For comprehensive development including C++ changes:

```bash
# 1. Install all dependencies
npm ci

# 2. Install build tools (requires system dependencies)
npm run install-build-deps  # Installs emsdk, vcpkg, playwright, bundler test deps

# 3. Build C++ to WASM
npm run build-cpp

# 4. Build TypeScript packages
npm run build-ws

# 5. Run full test suite
npm run test
```

### Workflow 3: Docker-Based Development
For consistent environment without local setup:

```bash
# Build and test in Docker
npm run build-docker
```

## Common Development Tasks

### Adding a New Method to a Package

1. **Identify the target package**
```bash
cd packages/[package-name]
```

2. **Understand the current API**
```typescript
// Look at src/index.ts and main class file
cat src/index.ts
cat src/[package-name].ts
```

3. **Add the new method**
```typescript
// In src/[package-name].ts
export class PackageName {
    // ... existing methods

    newMethod(input: string): string {
        // Implementation
        return this._wasmInstance.callMethod(input);
    }
}
```

4. **Add TypeScript types if needed**
```typescript
// Add to type definitions
export interface NewMethodOptions {
    option1?: string;
    option2?: number;
}
```

5. **Add tests**
```typescript
// In tests/[package-name].spec.ts
it("new method works", async () => {
    const lib = await PackageName.load();
    const result = lib.newMethod("test");
    expect(result).toBeDefined();
});
```

6. **Build and test**
```bash
npm run build
npm test
```

### Fixing a Bug

1. **Reproduce the issue**
```bash
# Write a failing test first
npm test -- --reporter=verbose
```

2. **Identify the root cause**
```typescript
// Add debug logging
console.log("Debug info:", variable);
```

3. **Make minimal fix**
```typescript
// Fix the specific issue
if (condition) {
    // Handle edge case
}
```

4. **Verify fix**
```bash
npm test
npm run lint
```

### Adding New Tests

1. **Identify test type needed**
- Unit tests: `tests/[package].spec.ts`
- Browser tests: `tests/[package].browser.spec.ts`
- Worker tests: `tests/worker.*.spec.ts`

2. **Follow existing patterns**
```typescript
import { describe, it, expect } from "vitest";
import { PackageName } from "@hpcc-js/wasm-packagename";

describe("Feature", () => {
    it("should do something", async () => {
        const lib = await PackageName.load();
        // Test implementation
    });
});
```

3. **Run tests**
```bash
npm test
```

## Troubleshooting Workflows

### Build Failures

1. **Clean and rebuild**
```bash
npm run clean-all
npm ci
npm run build-ws
```

2. **Check specific package**
```bash
cd packages/[failing-package]
npm run clean
npm run build
```

3. **Check dependencies**
```bash
npm ls
lerna ls
```

### Test Failures

1. **Run specific test**
```bash
cd packages/[package]
npm test -- --reporter=verbose
```

2. **Check if WASM files exist**
```bash
ls build/packages/*/src-cpp/*.wasm
```

3. **Run without browser tests**
```bash
npm run test-node
```

### Import/Export Issues

1. **Check package exports**
```bash
cat packages/[package]/package.json | grep -A 10 '"exports"'
```

2. **Verify built files exist**
```bash
ls packages/[package]/dist/
ls packages/[package]/types/
```

3. **Check TypeScript compilation**
```bash
cd packages/[package]
npm run gen-types
```

## Code Quality Workflows

### Before Committing Changes

1. **Run linting**
```bash
npm run lint
npm run lint-fix
```

2. **Build all packages**
```bash
npm run build-ws
```

3. **Test affected packages**
```bash
# Test specific packages
cd packages/[modified-package]
npm test
```

4. **Check types**
```bash
npx tsc --noEmit
```

### Documentation Updates

1. **Update TypeDoc comments**
```typescript
/**
 * Description of the method
 * @param input - Description of parameter
 * @returns Description of return value
 * @example
 * ```ts
 * const result = lib.method("example");
 * ```
 */
method(input: string): string { ... }
```

2. **Update README if needed**
```bash
# Check if package README needs updates
cat packages/[package]/README.md
```

3. **Generate documentation**
```bash
npm run gen-docs
```

## Release Workflow

### Version Bumping
```bash
# Update dependencies
npm run update

# Use lerna for version management
lerna version --conventional-commits
```

### Publishing
```bash
# Build everything
npm run build

# Publish via lerna
lerna publish from-package
```

## Emergency Fixes

### Reverting Changes
```bash
# Revert specific files
git checkout HEAD -- packages/[package]/src/[file].ts

# Revert last commit
git revert HEAD
```

### Quick Package Fix
```bash
# Fix specific package quickly
cd packages/[package]
npm run clean
npm run build
npm test
```

## Performance Considerations

### Memory Usage
- Large WASM files consume significant memory
- Test with realistic data sizes
- Monitor memory usage in browser dev tools

### Build Time
- C++ compilation is slowest part
- TypeScript builds are relatively fast
- Use watch modes for development

### Testing Speed
- Browser tests are slower than Node.js tests
- Run specific test suites during development
- Use CI for comprehensive testing

## AI Assistant Best Practices

1. **Always check current state** before making changes
2. **Test incrementally** after each change
3. **Follow existing patterns** rather than creating new ones
4. **Keep changes minimal** and focused
5. **Update documentation** when changing APIs
6. **Consider backward compatibility** for public APIs
7. **Test in both browser and Node.js** environments when applicable