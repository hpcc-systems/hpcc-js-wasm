import { describe, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expectReadmeVersion } from "../../util/tests/readme-version.ts";

const emsdkScriptPath = resolve(process.cwd(), "..", "..", "scripts", "cpp-install-emsdk.sh");
const vcpkgScriptPath = resolve(process.cwd(), "..", "..", "scripts", "cpp-install-vcpkg.sh");

function readText(path: string): string {
    return readFileSync(path, "utf8");
}

describe("tooling versions", () => {
    it("README emsdk version matches install script", () => {
        const script = readText(emsdkScriptPath);

        const scriptMatch = script.match(/VERSION=([0-9.]+)/);

        if (!scriptMatch) {
            throw new Error("emsdk install script version missing");
        }
        expectReadmeVersion("emsdk", scriptMatch[1]);
    });

    it("README vcpkg version matches install script", () => {
        const script = readText(vcpkgScriptPath);

        const scriptMatch = script.match(/VCPKG_BUILD_TOOLS_VERSION=([0-9.]+)/);

        if (!scriptMatch) {
            throw new Error("vcpkg install script version missing");
        }
        expectReadmeVersion("vcpkg", scriptMatch[1]);
    });
});