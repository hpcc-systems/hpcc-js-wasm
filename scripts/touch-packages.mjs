import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const releasePleaseConfigPath = path.join(repoRoot, "release-please-config.json");
const markerFileName = ".release-please-touch";
const dryRun = process.argv.includes("--dry-run");

async function main() {
    const releasePleaseConfig = JSON.parse(await readFile(releasePleaseConfigPath, "utf8"));
    const packagePaths = Object.keys(releasePleaseConfig.packages ?? {}).filter(packagePath => packagePath !== ".");

    if (packagePaths.length === 0) {
        throw new Error("No releasable packages found in release-please-config.json");
    }

    const timestamp = new Date().toISOString();

    for (const packagePath of packagePaths) {
        const markerPath = path.join(repoRoot, packagePath, markerFileName);
        const markerContents = `${packagePath}\n${timestamp}\n`;

        if (dryRun) {
            console.log(path.relative(repoRoot, markerPath));
            continue;
        }

        await writeFile(markerPath, markerContents, "utf8");
        console.log(`updated ${path.relative(repoRoot, markerPath)}`);
    }
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});