import { describe, expect, it } from "vitest";
import { HELP_TEXT, parseArgs } from "../src/cliArgs.ts";

describe("graphviz CLI arguments", () => {
    it("parses long options, positional arguments, and the terminator", () => {
        expect(parseArgs([
            "--layout=neato",
            "--format",
            "plain",
            "--neato-no-op",
            "2",
            "--invert-y",
            "input.dot",
            "--",
            "--version",
        ])).toEqual({
            layout: "neato",
            format: "plain",
            neatoNoOp: "2",
            invertY: true,
            positional: ["input.dot", "--version"],
        });
    });

    it("parses short option values, combined boolean flags, and help/version flags", () => {
        expect(parseArgs(["-Kdot", "-Tsvg", "-n2", "-yvh", "input.dot"])).toEqual({
            layout: "dot",
            format: "svg",
            neatoNoOp: "2",
            invertY: true,
            version: true,
            help: true,
            positional: ["input.dot"],
        });
        expect(parseArgs(["-K", "dot", "-T", "svg", "-n", "1"])).toEqual({
            layout: "dot",
            format: "svg",
            neatoNoOp: "1",
            positional: [],
        });
        expect(HELP_TEXT).toContain("Usage: dot-wasm");
    });

    it("rejects unknown options and missing values", () => {
        expect(() => parseArgs(["--unknown"])).toThrow("Unknown option --unknown");
        expect(() => parseArgs(["-z"])).toThrow("Unknown option -z");
        expect(() => parseArgs(["--layout"])).toThrow("--layout option requires a value.");
        expect(() => parseArgs(["--format"])).toThrow("--format option requires a value.");
        expect(() => parseArgs(["--neato-no-op"])).toThrow("--neato-no-op option requires a value.");
        expect(() => parseArgs(["-K"])).toThrow("-K option requires a value.");
        expect(() => parseArgs(["-T"])).toThrow("-T option requires a value.");
        expect(() => parseArgs(["-n"])).toThrow("-n option requires a value.");
    });
});
