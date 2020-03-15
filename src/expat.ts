// @ts-ignore
import * as expatlib from "../build/expat/expatlib/expatlib";
import { loadWasm, wasmFolder } from "./util";

export interface IExpat {
    startElement(tag: string, attrs: { [key: string]: string }): void;
    endElement(tag: string, attrs: { [key: string]: string }, content: string): void;
}

export function parse(xml: string, callback: IExpat): Promise<boolean> {
    return loadWasm(expatlib).then(module => {
        const parser = new module.StackParserJS();
        parser._attrs = function () {
            const retVal: { [key: string]: string } = {};
            const keys = this.attrs();
            keys.split("||").filter((key: string) => !!key).forEach((key: string) => {
                const parts = key.split("|");
                retVal[parts[0]] = parts[1];
            });
            return retVal;
        }
        parser.startElement = function () {
            callback.startElement(this.tag(), this._attrs());
        }
        parser.endElement = function () {
            callback.endElement(this.tag(), this._attrs(), this.content());
        }
        const retVal = parser.parse(xml);
        module.destroy(parser);
        return retVal;
    });
}
