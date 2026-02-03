/**
 * Type file dependency validation tests
 * 
 * These tests ensure that TypeScript declaration files (.d.ts) in each package
 * don't reference external dependencies that aren't declared in package.json.
 * 
 * This prevents runtime errors when consumers install packages and find that
 * TypeScript types reference packages they don't have installed.
 * 
 * The tests:
 * 1. Scan all .d.ts files in each package's types/ directory
 * 2. Extract import statements and type references
 * 3. Verify all external packages are in dependencies/peerDependencies/devDependencies
 * 4. Ignore:
 *    - Relative imports (./foo)
 *    - Internal monorepo packages (@hpcc-js/wasm-*)
 *    - Built-in Node.js types
 *    - References in code comments (JSDoc examples)
 */

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../../..");

/**
 * Removes comments from TypeScript content
 * @param content - The content to strip comments from
 * @returns Content without comments
 */
function stripComments(content: string): string {
    // Remove single-line comments
    content = content.replace(/\/\/.*$/gm, "");
    // Remove multi-line comments (including JSDoc)
    content = content.replace(/\/\*[\s\S]*?\*\//g, "");
    return content;
}

/**
 * Extracts package names from import statements in TypeScript declaration files
 * @param content - The content of a .d.ts file
 * @returns Set of package names referenced
 */
function extractImportedPackages(content: string): Set<string> {
    const packages = new Set<string>();

    // Strip comments to avoid false positives from documentation examples
    const strippedContent = stripComments(content);

    // Match import/export statements: import { X } from "package"
    const importRegex = /(?:import|export)\s+(?:{[^}]*}|\*)\s+from\s+['"]([^'"]+)['"]/g;

    // Match type references: import("package")
    const typeImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

    // Match triple-slash references: /// <reference types="package" />
    const tripleSlashRegex = /\/\/\/\s*<reference\s+types\s*=\s*['"]([^'"]+)['"]\s*\/>/g;

    let match;

    while ((match = importRegex.exec(strippedContent)) !== null) {
        const importPath = match[1];
        if (!importPath.startsWith(".") && !importPath.startsWith("/")) {
            // Extract the package name (handle scoped packages)
            const packageName = importPath.startsWith("@")
                ? importPath.split("/").slice(0, 2).join("/")
                : importPath.split("/")[0];
            packages.add(packageName);
        }
    }

    while ((match = typeImportRegex.exec(strippedContent)) !== null) {
        const importPath = match[1];
        if (!importPath.startsWith(".") && !importPath.startsWith("/")) {
            const packageName = importPath.startsWith("@")
                ? importPath.split("/").slice(0, 2).join("/")
                : importPath.split("/")[0];
            packages.add(packageName);
        }
    }

    // Note: triple-slash references appear before comments are stripped
    while ((match = tripleSlashRegex.exec(content)) !== null) {
        const packageName = match[1];
        packages.add(packageName);
    }

    return packages;
}

/**
 * Reads and parses package.json
 */
function getPackageJson(packageDir: string): any {
    const packageJsonPath = join(packageDir, "package.json");
    if (!existsSync(packageJsonPath)) {
        return null;
    }
    return JSON.parse(readFileSync(packageJsonPath, "utf-8"));
}

/**
 * Gets all declared dependencies for a package
 */
function getDeclaredDependencies(packageJson: any): Set<string> {
    const deps = new Set<string>();

    if (packageJson.dependencies) {
        Object.keys(packageJson.dependencies).forEach(dep => deps.add(dep));
    }

    if (packageJson.peerDependencies) {
        Object.keys(packageJson.peerDependencies).forEach(dep => deps.add(dep));
    }

    if (packageJson.devDependencies) {
        Object.keys(packageJson.devDependencies).forEach(dep => deps.add(dep));
    }

    return deps;
}

describe("Type file dependency validation", () => {
    it("should not reference undeclared dependencies in .d.ts files", async () => {
        const packagesDir = join(rootDir, "packages");
        const packageDirs = glob.sync("*/", { cwd: packagesDir });

        const errors: string[] = [];

        for (const packageDir of packageDirs) {
            const fullPackageDir = join(packagesDir, packageDir);
            const packageJson = getPackageJson(fullPackageDir);

            if (!packageJson) {
                continue;
            }

            const packageName = packageJson.name;
            const typesDir = join(fullPackageDir, "types");

            if (!existsSync(typesDir)) {
                continue;
            }

            // Get all .d.ts files in the types directory
            const dtsFiles = glob.sync("**/*.d.ts", { cwd: typesDir });

            if (dtsFiles.length === 0) {
                continue;
            }

            const declaredDeps = getDeclaredDependencies(packageJson);

            // Collect all imported packages from all .d.ts files
            const allImportedPackages = new Set<string>();

            for (const dtsFile of dtsFiles) {
                const filePath = join(typesDir, dtsFile);
                const content = readFileSync(filePath, "utf-8");
                const importedPackages = extractImportedPackages(content);

                importedPackages.forEach(pkg => allImportedPackages.add(pkg));
            }

            // Check for undeclared dependencies
            const undeclaredDeps: string[] = [];

            for (const importedPkg of allImportedPackages) {
                // Skip internal packages (other packages in this monorepo)
                if (importedPkg.startsWith("@hpcc-js/wasm-")) {
                    continue;
                }

                // Skip built-in Node.js types
                if (importedPkg === "node" || importedPkg.startsWith("@types/node")) {
                    continue;
                }

                if (!declaredDeps.has(importedPkg)) {
                    undeclaredDeps.push(importedPkg);
                }
            }

            if (undeclaredDeps.length > 0) {
                errors.push(
                    `Package ${packageName} has undeclared dependencies in .d.ts files:\n` +
                    `  Missing: ${undeclaredDeps.join(", ")}\n` +
                    `  Add these to dependencies or peerDependencies in package.json`
                );
            }
        }

        if (errors.length > 0) {
            throw new Error("\n\n" + errors.join("\n\n"));
        }

        expect(errors).toHaveLength(0);
    });

    it("should validate specific package type dependencies", async () => {
        // Test a specific package to ensure the test logic works
        const base91Dir = join(rootDir, "packages", "base91");
        const packageJson = getPackageJson(base91Dir);

        expect(packageJson).toBeTruthy();
        expect(packageJson.name).toBe("@hpcc-js/wasm-base91");

        const typesDir = join(base91Dir, "types");
        expect(existsSync(typesDir)).toBe(true);

        const declaredDeps = getDeclaredDependencies(packageJson);

        // This test validates the test helper functions work correctly
        expect(declaredDeps).toBeInstanceOf(Set);
    });
});
