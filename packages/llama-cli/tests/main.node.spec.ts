import { describe, expect, it } from "vitest";
import { execFile } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { WebBlob } from "@hpcc-js/wasm-llama";
import { HELP_TEXT, parseArgs } from "../src/cliArgs.ts";

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const storiesModel = resolve(__dirname, "../../llama/.vitest-attachments/stories260K.gguf");
const storiesModelArg = "../llama/.vitest-attachments/stories260K.gguf";
const storiesModelUrl = "https://huggingface.co/ggml-org/models/resolve/main/tinyllamas/stories260K.gguf";

async function ensureStoriesModel() {
    if (existsSync(storiesModel)) {
        return;
    }

    const webBlob = await WebBlob.create(new URL(storiesModelUrl));
    const data = await webBlob.arrayBuffer();
    mkdirSync(dirname(storiesModel), { recursive: true });
    writeFileSync(storiesModel, Buffer.from(data));
}

describe("parseArgs", () => {
    it("documents direct forwarding of llama.cpp arguments", () => {
        expect(HELP_TEXT).toContain("Usage: wasm-llama-cli [options] [llama.cpp options]");
        expect(HELP_TEXT).toContain("The -- separator is optional");
    });

    it("returns defaults when no arguments are supplied", () => {
        const result = parseArgs([]);
        expect(result).toEqual({
            mainArgs: []
        });
    });

    it("extracts local model flags and forwards llama.cpp args", () => {
        const result = parseArgs(["-m", "./model.gguf", "-p", "Hello", "-n", "64"]);
        expect(result.model).toBe("./model.gguf");
        expect(result.mainArgs).toEqual(["-p", "Hello", "-n", "64"]);
    });

    it("extracts inline model values", () => {
        expect(parseArgs(["-m./model.gguf"]).model).toBe("./model.gguf");
        expect(parseArgs(["--model=https://huggingface.co/user/repo/resolve/main/model.gguf"]).model).toBe("https://huggingface.co/user/repo/resolve/main/model.gguf");
    });

    it("parses wrapper flags", () => {
        const result = parseArgs(["--version", "--llama-help", "-h"]);
        expect(result.version).toBe(true);
        expect(result.llamaHelp).toBe(true);
        expect(result.help).toBe(true);
        expect(result.mainArgs).toEqual([]);
    });

    it("supports the terminator token", () => {
        const result = parseArgs(["--model", "./model.gguf", "--", "--help", "--version"]);
        expect(result.model).toBe("./model.gguf");
        expect(result.mainArgs).toEqual(["--help", "--version"]);
    });

    it("throws on missing model values", () => {
        expect(() => parseArgs(["-m"])).toThrow("-m option requires a value.");
        expect(() => parseArgs(["--model"])).toThrow("--model option requires a value.");
    });
});

describe("llama-cli", () => {
    it("uses -- to pass protected arguments to llama.cpp", async () => {
        const { stdout } = await execFileAsync("npx", [".", "--", "--help"], {
            cwd: packageRoot,
            maxBuffer: 1024 * 1024 * 10,
            timeout: 180000
        });

        expect(stdout).toContain("usage:");
    }, 180000);

    it("runs llama.cpp main with a local model", async () => {
        await ensureStoriesModel();

        const { stdout } = await execFileAsync("npx", [
            ".",
            "-m",
            storiesModelArg,
            "--single-turn",
            "--no-conversation",
            "--log-disable",
            "--no-display-prompt",
            "-p",
            "hello",
            "-n",
            "64",
            "-t",
            "1",
            "-tb",
            "1",
        ], {
            cwd: packageRoot,
            maxBuffer: 1024 * 1024 * 10,
            timeout: 180000
        });

        expect(stdout).to.be.a("string");
        expect(stdout.trim().length).to.be.greaterThan(0);
    }, 180000);
});
