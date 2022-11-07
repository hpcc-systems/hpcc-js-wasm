// @ts-ignore
import { loadWasm } from "./expatlib.wasm";

export type Attributes = { [key: string]: string };
export interface IParser {
    startElement(tag: string, attrs: Attributes): void;
    endElement(tag: string): void;
    characterData(content: string): void;
}

function parseAttrs(attrs: string): Attributes {
    const retVal: Attributes = {};
    const keys = attrs;
    const sep = `${String.fromCharCode(1)}`;
    const sep2 = `${sep}${sep}`;
    keys.split(sep2).filter((key: string) => !!key).forEach((key: string) => {
        const parts = key.split(sep);
        retVal[parts[0]] = parts[1];
    });
    return retVal;
}

/**
 * Expat XML parser WASM library, provides a simplified wrapper around the Expat XML Parser library.  
 * 
 * See [libexpat.github.io](https://libexpat.github.io/) for c++ details.
 * 
 * ```ts
 * import { Expat } from "@hpcc-js/wasm/expat";
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
export class Expat {

    private constructor(protected _module: any) {
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
        return loadWasm().then((module: any) => {
            return new Expat(module);
        });
    }

    /**
     * 
     * @returns The Expat c++ version
     */
    version(): string {
        return this._module.CExpat.prototype.version();
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
        const parser = new this._module.CExpatJS();
        parser.startElement = function () {
            callback.startElement(this.tag(), parseAttrs(this.attrs()));
        };
        parser.endElement = function () {
            callback.endElement(this.tag());
        };
        parser.characterData = function () {
            callback.characterData(this.content());
        };
        parser.create();
        const retVal = parser.parse(xml);
        parser.destroy();
        this._module.destroy(parser);
        return retVal;
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

