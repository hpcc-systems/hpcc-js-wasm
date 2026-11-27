/// <reference types="vite/client" />
import { expect } from "vitest";
import readme from "../../../README.md?raw";

export function expectReadmeVersion(library: string, version: string): void {
    const entries = [...readme.matchAll(/^- \[([^\]]+)\]\([^\r\n]+\) - v?([0-9]+(?:\.[0-9]+)+)\s*$/gm)]
        .filter(entry => entry[1] === library);

    expect(entries, `README.md must state exactly one version for ${library}`).toHaveLength(1);
    expect(version.replace(/^(?:expat_|v)/, ""), `README.md ${library} version must match the built version`)
        .toEqual(entries[0][2]);
}
