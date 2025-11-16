import { describe, expect, it } from "vitest";
import { parseArgs } from "../src/cliArgs.ts";

describe("parseArgs", () => {
    it("returns defaults when no arguments are supplied", () => {
        const result = parseArgs([]);
        expect(result).toEqual({
            positional: []
        });
    });

    it("parses long and short options with values", () => {
        const result = parseArgs(["-K", "neato", "-Tjson", "-n", "2", "-yv", "input.dot"]);
        expect(result.layout).toBe("neato");
        expect(result.format).toBe("json");
        expect(result.neatoNoOp).toBe("2");
        expect(result.invertY).toBe(true);
        expect(result.version).toBe(true);
        expect(result.positional).toEqual(["input.dot"]);
    });

    it("supports long options with inline values and the terminator token", () => {
        const result = parseArgs(["--format=plain", "--", "-K", "ignored"]);
        expect(result.format).toBe("plain");
        expect(result.positional).toEqual(["-K", "ignored"]);
    });

    it("throws on missing values", () => {
        expect(() => parseArgs(["-K"])).toThrow("-K option requires a value.");
        expect(() => parseArgs(["--format"])).toThrow("--format option requires a value.");
    });

    it("throws on unknown options", () => {
        expect(() => parseArgs(["--unknown"])).toThrow("Unknown option --unknown");
        expect(() => parseArgs(["-z"])).toThrow("Unknown option -z");
    });
});
