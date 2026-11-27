import { describe, expect, it, vi } from "vitest";
import { expectReadmeVersion } from "../../util/tests/readme-version.ts";

vi.mock("../../../README.md?raw", () => ({
    default: `
Example version: v9.9.9
- [base91](https://base91.sourceforge.net/) - v0.6.0
- [duckdb](https://github.com/duckdb/duckdb) - v2.0.1
- [expat](https://libexpat.github.io/) - v2.9.0
- [vcpkg](https://github.com/microsoft/vcpkg) - 2026.10.16
- [graphviz](https://www.graphviz.org/) - unknown
- [zstd](https://github.com/facebook/zstd) - v1.5.7
- [zstd](https://github.com/facebook/zstd) - v1.5.8
`
}));

describe("README version checks", () => {
    it.each([
        ["base91", "0.6.0"],
        ["duckdb", "v2.0.1"],
        ["expat", "expat_2.9.0"],
        ["vcpkg", "2026.10.16"]
    ])("matches the documented %s version", (library, version) => {
        expectReadmeVersion(library, version);
    });

    it("rejects a stale README version", () => {
        expect(() => expectReadmeVersion("base91", "0.7.0"))
            .toThrow("README.md base91 version must match the built version");
    });

    it.each(["missing", "graphviz", "zstd"])("rejects missing, invalid or duplicate versions for %s", library => {
        expect(() => expectReadmeVersion(library, "1.0.0"))
            .toThrow(`README.md must state exactly one version for ${library}`);
    });
});
