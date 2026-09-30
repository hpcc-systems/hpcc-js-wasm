import { describe, expect, it } from "vitest";
import { replaceFunctionByName } from "../../../utils/esbuild-plugins.js";

describe("Llama worker glue", () => {
    it("removes an Emscripten WASM URL even when the generated function changes", () => {
        const glue = 'function findWasmBinary(){if(Module.locateFile){return locateFile("llamalib.wasm")}return new URL("llamalib.wasm", import.meta.url).href}function getBinarySync(file){}';
        const result = replaceFunctionByName(
            glue,
            "findWasmBinary",
            'function findWasmBinary(){return ""}',
            [/function\s+findWasmBinary\s*\([^)]*\)\s*\{/g]
        );

        expect(result).toBe('function findWasmBinary(){return ""}function getBinarySync(file){}');
        expect(result).not.toContain("llamalib.wasm");
    });
});
