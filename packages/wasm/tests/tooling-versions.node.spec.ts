import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const readmePath = resolve(process.cwd(), "..", "..", "README.md");
const emsdkScriptPath = resolve(process.cwd(), "..", "..", "scripts", "cpp-install-emsdk.sh");
const vcpkgScriptPath = resolve(process.cwd(), "..", "..", "scripts", "cpp-install-vcpkg.sh");

function readText(path: string): string {
    return readFileSync(path, "utf8");
}

describe("tooling versions", () => {
    it("README emsdk version matches install script", () => {
        const readme = readText(readmePath);
        const script = readText(emsdkScriptPath);

        const readmeMatch = readme.match(/- \[emsdk\][^\n]*- v([0-9.]+)/i);
        const scriptMatch = script.match(/VERSION=([0-9.]+)/);

        expect(readmeMatch, "README emsdk version missing").toBeTruthy();
        expect(scriptMatch, "emsdk install script version missing").toBeTruthy();

        const readmeVersion = readmeMatch?.[1];
        const scriptVersion = scriptMatch?.[1];

        expect(readmeVersion).to.equal(scriptVersion);
    });

    it("README vcpkg version matches install script", () => {
        const readme = readText(readmePath);
        const script = readText(vcpkgScriptPath);

        const readmeMatch = readme.match(/- \[vcpkg\][^\n]*- ([0-9.]+)/i);
        const scriptMatch = script.match(/VCPKG_BUILD_TOOLS_VERSION=([0-9.]+)/);

        expect(readmeMatch, "README vcpkg version missing").toBeTruthy();
        expect(scriptMatch, "vcpkg install script version missing").toBeTruthy();

        const readmeVersion = readmeMatch?.[1];
        const scriptVersion = scriptMatch?.[1];

        expect(readmeVersion).to.equal(scriptVersion);
    });
});