// @ts-ignore
import * as expatlib from "../build/expat/expatlib/expatlib";
import { loadWasm } from "./util";

export type Attributes = { [key: string]: string };
export interface IParser {
    startElement(tag: string, attrs: Attributes): void;
    endElement(tag: string): void;
    characterData(content: string): void;
}

class StackElement {

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

    parse(xml: string): Promise<boolean> {
        return parse(xml, this);
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

export function parse(xml: string, callback: IParser, wasmFolder?: string, wasmBinary?: Uint8Array): Promise<boolean> {
    return loadWasm(expatlib, wasmFolder, wasmBinary).then(module => {
        const parser = new module.CExpatJS();
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
        module.destroy(parser);
        return retVal;
    });
}
