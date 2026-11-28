import { describe, it, expect } from "vitest";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WitBindgen } from "@hpcc-js/wasm-wit-bindgen";

const TEST_WIT = `package example:test;

world test-world {
    export greet: func(name: string) -> string;
}
`;

const decode = (files: Record<string, Uint8Array>) => Object.values(files).map(f => new TextDecoder().decode(f)).join("\n");

describe("wit-bindgen typescript", function () {
    it("guest", async function () {
        const witBindgen = await WitBindgen.load();
        const files = await witBindgen.generateTypeScript(TEST_WIT);
        expect(Object.keys(files).some(name => name.endsWith(".d.ts"))).toBe(true);
        expect(decode(files)).toContain("greet");
    });

    it("host", async function () {
        const witBindgen = await WitBindgen.load();
        const guest = await witBindgen.generateTypeScript(TEST_WIT, { mode: "guest", worldName: "test-world" });
        const host = await witBindgen.generateTypeScript(TEST_WIT, { mode: "host", worldName: "test-world" });
        expect(decode(host)).toContain("greet");
        expect(decode(host)).not.toEqual(decode(guest));
    });

    it("from path", async function () {
        const witBindgen = await WitBindgen.load();
        const dir = await mkdtemp(join(tmpdir(), "wit-bindgen-test-"));
        try {
            const witPath = join(dir, "test.wit");
            await writeFile(witPath, TEST_WIT, "utf8");
            const files = await witBindgen.generateTypeScriptFromPath(witPath);
            expect(decode(files)).toContain("greet");
        } finally {
            await rm(dir, { recursive: true, force: true });
        }
    });

    it("invalid WIT", async function () {
        const witBindgen = await WitBindgen.load();
        await expect(witBindgen.generateTypeScript("not wit")).rejects.toThrow();
    });
});
