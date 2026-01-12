// @ts-expect-error importing from a wasm file is resolved via a custom esbuild plugin
import load, { reset } from "../../../build/packages/expat/expatlib.wasm";
import type { MainModule, map_string_string } from "../types/expatlib.js";
import { MainModuleEx } from "@hpcc-js/wasm-util";

export type Attributes = { [key: string]: string };
export interface IParser {
    startElement(tag: string, attrs: Attributes): void;
    endElement(tag: string): void;
    characterData(content: string): void;
}

function parseAttrs(attrs: map_string_string): Attributes {
    const retVal: Attributes = {};
    const keys = attrs.keys();
    const size = keys.size();
    for (let i = 0; i < size; ++i) {
        const key = keys.get(i);
        const value = attrs.get(key!);
        retVal[key!] = value!;
    }
    return retVal;
}

let g_expat: Promise<Expat>;

/**
 * Expat XML parser WASM library, provides a simplified wrapper around the Expat XML Parser library.  
 * 
 * See [libexpat.github.io](https://libexpat.github.io/) for c++ details.
 * 
 * ```ts
 * import { Expat } from "@hpcc-js/wasm-expat";
 * 
 * const expat = await Expat.load();
 * 
 * const xml = ` \
 *     <root>
 *         <child xxx="yyy">content</child>
 *     </root>
 * `;
 * 
 * const callback = {
 *     startElement(tag, attrs) { console.log("start", tag, attrs); },
 *     endElement(tag) { console.log("end", tag); },
 *     characterData(content) { console.log("characterData", content); }
 * };
 * 
 * expat.parse(xml, callback);
 * ```
 
 */
export class Expat extends MainModuleEx<MainModule> {

    private constructor(_module: MainModule) {
        super(_module);
    }

    /**
     * Compiles and instantiates the raw wasm.
     * 
     * ::: info
     * In general WebAssembly compilation is disallowed on the main thread if the buffer size is larger than 4KB, hence forcing `load` to be asynchronous;
     * :::
     * 
     * @returns A promise to an instance of the Expat class.
     */
    static load(): Promise<Expat> {
        if (!g_expat) {
            g_expat = (load() as Promise<MainModule>).then((module) => new Expat(module));
        }
        return g_expat;
    }

    /**
     * Unloades the compiled wasm instance.
     */
    static unload() {
        reset();
    }

    /**
     * 
     * @returns The Expat c++ version
     */
    version(): string {
        return this._module.version();
    }

    /**
     * Parses the XML with suitable callbacks.
     * 
     * :::tip
     * The _IParser.characterData_ callback method can get called several times for a single tag element.
     * :::
     * 
     * @param xml string containing XML
     * @param callback Callback interface
     * @returns `true`|`false` if the XML parse succeeds.
     */
    parse(xml: string, callback: IParser): boolean {
        return this._module.parse(xml, {
            startElement: (tag: string, attrs: map_string_string) => callback.startElement(tag, parseAttrs(attrs)),
            endElement: (tag: string) => callback.endElement(tag),
            characterData: (content: string) => callback.characterData(content)
        });
    }
}

export class StackElement {

    private _content = "";
    get content(): string {
        return this._content;
    }

    constructor(readonly tag: string, readonly attrs: Attributes) {
    }

    appendContent(content: string) {
        this._content += content;
    }
}

export class StackParser implements IParser {
    private _stack: StackElement[] = [];

    async parse(xml: string): Promise<boolean> {
        const expat = await Expat.load();
        return expat.parse(xml, this);
    }

    top(): StackElement {
        return this._stack[this._stack.length - 1];
    }

    startElement(tag: string, attrs: Attributes): StackElement {
        const retVal = new StackElement(tag, attrs);
        this._stack.push(retVal);
        return retVal;
    }

    endElement(tag: string): StackElement {
        return this._stack.pop()!;
    }

    characterData(content: string): void {
        this.top().appendContent(content);
    }
}
