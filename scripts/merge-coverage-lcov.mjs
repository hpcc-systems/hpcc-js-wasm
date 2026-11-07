import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagesDir = resolve(root, "packages");
const records = [];

for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
        continue;
    }

    const packageDir = resolve(packagesDir, entry.name);
    const reportPath = resolve(packageDir, "coverage/lcov.info");
    const packageJsonPath = resolve(packageDir, "package.json");
    if (!existsSync(packageJsonPath)) {
        continue;
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    if (!packageJson.scripts?.coverage) {
        continue;
    }
    if (!existsSync(reportPath)) {
        throw new Error(`Missing coverage report for ${packageJson.name}: ${reportPath}`);
    }

    const sourceDir = resolve(packageDir, "src") + sep;
    const report = readFileSync(reportPath, "utf8");
    for (const rawRecord of report.split(/end_of_record\s*/).filter(record => record.trim())) {
        const sourceLine = rawRecord.split(/\r?\n/).find(line => line.startsWith("SF:"));
        if (!sourceLine) {
            continue;
        }

        const sourcePath = resolve(packageDir, sourceLine.slice(3));
        if (!sourcePath.startsWith(sourceDir) || extname(sourcePath) !== ".ts") {
            continue;
        }

        const repositoryPath = relative(root, sourcePath).split(sep).join("/");
        records.push(rawRecord.replace(sourceLine, `SF:${repositoryPath}`).trimEnd());
    }
}

if (records.length === 0) {
    throw new Error("No package TypeScript coverage records found");
}

const outputPath = resolve(root, "coverage/lcov.info");
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${records.join("\nend_of_record\n")}\nend_of_record\n`);
console.log(`Merged ${records.length} TypeScript coverage records to ${relative(root, outputPath)}`);
