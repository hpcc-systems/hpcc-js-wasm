import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, unlinkSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { execFileSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, "..");

describe("zstd fixtures and external package (node)", function () {

    it("decodes committed native CLI fixtures", async function () {
        const fixtureDir = join(__dirname, "fixtures");
        const known = join(fixtureDir, "hello-known.zst");
        expect(existsSync(known)).to.equal(true);

        const { Zstd } = await import("@hpcc-js/wasm-zstd");
        const zstd = await Zstd.load();
        const knownBytes = new Uint8Array(readFileSync(known));
        expect(new TextDecoder().decode(zstd.decompress(knownBytes))).to.equal("hello\n");

        const unknown = join(fixtureDir, "zeros-4mib-unknown.zst");
        expect(existsSync(unknown)).to.equal(true);
        const unknownBytes = new Uint8Array(readFileSync(unknown));
        const out = zstd.decompress(unknownBytes);
        expect(out.length).to.equal(4 * 1024 * 1024);
        expect(out.every((b) => b === 0)).to.equal(true);
    });

    it("external entry has no embedded WASM payload and package files include the asset", async function () {
        const externalJs = join(pkgRoot, "dist/external.js");
        const wasmAsset = join(pkgRoot, "dist/zstdlib.wasm");
        const embeddedJs = join(pkgRoot, "dist/index.js");
        expect(existsSync(externalJs)).to.equal(true);
        expect(existsSync(wasmAsset)).to.equal(true);
        expect(existsSync(embeddedJs)).to.equal(true);

        const externalSource = readFileSync(externalJs, "utf8");
        const embeddedSource = readFileSync(embeddedJs, "utf8");
        // Embedded entry contains a long base91 blob; external entry must not.
        expect(embeddedSource.length).to.be.greaterThan(externalSource.length + 10_000);
        expect(externalSource.includes("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~\"")).to.equal(false);
        expect(externalSource.includes("wasmBinary")).to.equal(true);

        const packed = execFileSync("npm", ["pack", "--json"], {
            cwd: pkgRoot,
            encoding: "utf8"
        });
        const [{ filename }] = JSON.parse(packed) as Array<{ filename: string; }>;
        const tarball = join(pkgRoot, filename);
        try {
            const listing = execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" });
            expect(listing).to.match(/package\/dist\/external\.js/);
            expect(listing).to.match(/package\/dist\/external\.umd\.js/);
            expect(listing).to.match(/package\/dist\/zstdlib\.wasm/);
            expect(listing).to.match(/package\/types\/external\.d\.ts/);
            expect(existsSync(join(pkgRoot, "dist/external.umd.js"))).to.equal(true);
        } finally {
            if (existsSync(tarball)) {
                unlinkSync(tarball);
            }
        }
    });

    it("external entry loads WASM from an explicit file URL", async function () {
        const { Zstd } = await import("@hpcc-js/wasm-zstd/external");
        await Zstd.unload();
        // Node's fetch() does not support file://; pass bytes directly (Workers use wasmUrl).
        const wasmBinary = new Uint8Array(readFileSync(join(pkgRoot, "dist/zstdlib.wasm")));
        const zstd = await Zstd.load({
            wasmUrl: pathToFileURL(join(pkgRoot, "dist/zstdlib.wasm")),
            wasmBinary
        });
        const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
        expect(zstd.decompress(zstd.compress(data))).to.deep.equal(data);
        await Zstd.unload();
    });

    it("external entry concurrent load() shares one singleton initialization", async function () {
        const { Zstd } = await import("@hpcc-js/wasm-zstd/external");
        await Zstd.unload();
        const wasmBinary = new Uint8Array(readFileSync(join(pkgRoot, "dist/zstdlib.wasm")));
        const opts = {
            wasmUrl: pathToFileURL(join(pkgRoot, "dist/zstdlib.wasm")),
            wasmBinary
        };
        const [a, b] = await Promise.all([Zstd.load(opts), Zstd.load(opts)]);
        expect(a).to.equal(b);
        await Zstd.unload();
    });

    it("external entry rejects missing wasmUrl and invalid URLs", async function () {
        const { Zstd } = await import("@hpcc-js/wasm-zstd/external");
        await Zstd.unload();
        await expect(Zstd.load()).rejects.toThrow(/wasmUrl|wasmBinary/i);
        await Zstd.unload();
        await expect(Zstd.load({ wasmUrl: "http://127.0.0.1:1/missing-zstd.wasm" })).rejects.toThrow(/Failed to load Zstd WASM/i);
        await Zstd.unload();
    });
});
