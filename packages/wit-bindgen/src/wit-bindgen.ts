import { witValidator } from "../../../build/packages/wit-bindgen/wit_bindgen_wasm.js";
import type * as Validator from "../../../build/packages/wit-bindgen/interfaces/wit-bindgen-wasm-wit-validator.js";

type WitValidator = typeof Validator;

const validator: WitValidator = witValidator;

/** Languages supported by {@link WitBindgen.generateBindings} (aliases `c++`, `c#` and `md` are also accepted). */
export type BindingsLanguage = "rust" | "c" | "cpp" | "csharp" | "go" | "moonbit" | "markdown";

/** Optional multi-file context used to resolve `use`/`import` statements between WIT files. */
export interface WitSource {
    /** Path of the WIT content being processed */
    sourcePath?: string;
    /** Map of path to content for all WIT files the content may reference */
    sourceFiles?: Record<string, string>;
}

export interface WitValidationResult {
    valid: boolean;
    error?: string;
    errorType?: "validation" | "dependency" | "parsing";
}

export interface GenerateBindingsOptions extends WitSource {
    /** World to generate bindings for, defaults to the package's only/default world */
    worldName?: string;
}

function toSourceFilesJson(source?: WitSource): string | undefined {
    return source?.sourceFiles ? JSON.stringify(source.sourceFiles) : undefined;
}

//  The component returns file contents as Latin1 strings so binary data survives the string boundary.
function latin1ToBytes(content: string): Uint8Array {
    const bytes = new Uint8Array(content.length);
    for (let i = 0; i < content.length; ++i) {
        bytes[i] = content.charCodeAt(i) & 0xff;
    }
    return bytes;
}

function decodeFileMap(json: string): Record<string, Uint8Array> {
    const files: Record<string, string> = JSON.parse(json);
    const retVal: Record<string, Uint8Array> = {};
    for (const [name, content] of Object.entries(files)) {
        retVal[name] = latin1ToBytes(content);
    }
    return retVal;
}

/** "guest" generates types for implementing a world, "host" generates types for consuming a component built from it. */
export type TypeScriptMode = "guest" | "host";

export interface GenerateTypeScriptOptions {
    /** Defaults to "guest" */
    mode?: TypeScriptMode;
    /** World to generate types for */
    worldName?: string;
}

type JcoTypes = (witPath: string, opts: { worldName?: string; guest?: boolean }) => Promise<Record<string, Uint8Array>>;

//  jco is an optional peer dependency and is only loaded (Node.js only) when TypeScript output is requested.
async function loadJcoTypes(): Promise<JcoTypes> {
    try {
        const jco = await import("@bytecodealliance/jco") as unknown as { types: JcoTypes };
        return jco.types;
    } catch (e) {
        throw new Error(`TypeScript generation requires Node.js and the optional peer dependency "@bytecodealliance/jco": ${e instanceof Error ? e.message : e}`, { cause: e });
    }
}

let g_witBindgen: Promise<WitBindgen> | undefined;

/**
 * The wit-bindgen WASM library, provides WIT validation and language binding generation
 * by wrapping the Rust [wit-bindgen](https://github.com/bytecodealliance/wit-bindgen) generators.
 *
 * ```ts
 * import { WitBindgen } from "@hpcc-js/wasm-wit-bindgen";
 *
 * const witBindgen = await WitBindgen.load();
 *
 * const wit = `package example:test;
 * world test-world {
 *     export greet: func(name: string) -> string;
 * }`;
 *
 * console.log(witBindgen.validate(wit));
 * const files = witBindgen.generateBindings(wit, "rust");
 * ```
 */
export class WitBindgen {

    private constructor() {
    }

    /**
     * Compiles and instantiates the WASM library.
     *
     * ::: tip
     * `load()` returns a process-wide singleton, calling it multiple times is safe.
     * :::
     *
     * @returns A promise to an instance of the WitBindgen class.
     */
    static load(): Promise<WitBindgen> {
        if (!g_witBindgen) {
            g_witBindgen = Promise.resolve(new WitBindgen());
        }
        return g_witBindgen;
    }

    /**
     * Unloading is a no-op, the component is self-contained and shared.  Provided for API symmetry with other packages.
     */
    static unload() {
        g_witBindgen = undefined;
    }

    /**
     * @returns The version of the wit-bindgen libraries the WASM was built with (e.g. "0.63").
     */
    version(): string {
        return validator.getWitBindgenVersion();
    }

    /**
     * @param content WIT source
     * @param source optional multi-file context
     * @returns true if the WIT parses and resolves
     */
    validate(content: string, source?: WitSource): boolean {
        return validator.validateWitSyntax(content, source?.sourcePath, toSourceFilesJson(source));
    }

    /**
     * @param content WIT source
     * @param source optional multi-file context
     * @returns validity plus error details when invalid
     */
    validateDetailed(content: string, source?: WitSource): WitValidationResult {
        return JSON.parse(validator.validateWitSyntaxDetailed(content, source?.sourcePath, toSourceFilesJson(source)));
    }

    /**
     * @param content WIT source
     * @returns The names of the interfaces declared in the package
     */
    extractInterfaces(content: string): string[] {
        const retVal = validator.extractInterfaces(content);
        return retVal ? retVal.split(",").map(name => name.trim()) : [];
    }

    /**
     * @param content WIT source
     * @returns true if the package declares at least one world
     */
    hasWorldDefinition(content: string): boolean {
        return validator.hasWorldDefinition(content);
    }

    /**
     * @param filename name to test
     * @returns true if the filename has a `.wit` extension
     */
    isWitFileExtension(filename: string): boolean {
        return validator.isWitFileExtension(filename);
    }

    /**
     * Generate language bindings from WIT content.
     *
     * @param content WIT source
     * @param language target language
     * @param options optional world name and multi-file context
     * @returns map of generated file name to file content
     */
    generateBindings(content: string, language: BindingsLanguage | "c++" | "c#" | "md", options: GenerateBindingsOptions = {}): Record<string, Uint8Array> {
        return decodeFileMap(validator.generateBindings(content, language, options.worldName, options.sourcePath, toSourceFilesJson(options)));
    }

    /**
     * @param bytes a WebAssembly component binary
     * @returns the WIT text describing the component, or an empty string if it could not be extracted
     */
    extractWitFromComponent(bytes: Uint8Array): string {
        return validator.extractWitFromComponent(bytes);
    }

    /**
     * @param bytes a WebAssembly component binary
     * @returns map of file name to the core modules embedded in the component (empty if none)
     */
    extractCoreWasmFromComponent(bytes: Uint8Array): Record<string, Uint8Array> {
        return decodeFileMap(validator.extractCoreWasmFromComponent(bytes));
    }

    /**
     * Generate TypeScript declaration files (.d.ts) from WIT content.
     *
     * ::: warning
     * Unlike the other methods this is backed by [jco](https://github.com/bytecodealliance/jco), so it is Node.js only
     * and requires the optional peer dependency `@bytecodealliance/jco`.
     * :::
     *
     * @param content WIT source
     * @param options mode ("guest" | "host") and optional world name
     * @returns map of generated file name to file content
     */
    async generateTypeScript(content: string, options: GenerateTypeScriptOptions = {}): Promise<Record<string, Uint8Array>> {
        const types = await loadJcoTypes();
        const { mkdtemp, writeFile, rm } = await import("node:fs/promises");
        const { tmpdir } = await import("node:os");
        const { join } = await import("node:path");
        const dir = await mkdtemp(join(tmpdir(), "wit-bindgen-ts-"));
        try {
            const witPath = join(dir, "input.wit");
            await writeFile(witPath, content, "utf8");
            return await types(witPath, { worldName: options.worldName, ...(options.mode !== "host" ? { guest: true } : {}) });
        } finally {
            await rm(dir, { recursive: true, force: true });
        }
    }

    /**
     * Generate TypeScript declaration files (.d.ts) from a WIT file or directory on disk (Node.js only, see {@link generateTypeScript}).
     * Passing a path allows `deps/` directories to be resolved.
     *
     * @param witPath path to a `.wit` file or a directory of WIT files
     * @param options mode ("guest" | "host") and optional world name
     * @returns map of generated file name to file content
     */
    async generateTypeScriptFromPath(witPath: string, options: GenerateTypeScriptOptions = {}): Promise<Record<string, Uint8Array>> {
        const types = await loadJcoTypes();
        return types(witPath, { worldName: options.worldName, ...(options.mode !== "host" ? { guest: true } : {}) });
    }
}
