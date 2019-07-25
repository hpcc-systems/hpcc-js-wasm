import PromiseWorker from "promise-worker";
import { PKG_BASE } from "./util";

declare const window: any;

let _wasmFolder: string = window.__hpcc_wasmFolder || `${PKG_BASE}/dist`;
export function wasmFolder(_?: string): string {
    if (_ === void 0) return _wasmFolder;
    const retVal = _wasmFolder;
    _wasmFolder = _;
    return retVal;
}

let _promiseWorker: PromiseWorker;
function promiseWorker() {
    if (!_promiseWorker) {
        const worker = new Worker(`${_wasmFolder}/worker.min.js`);
        _promiseWorker = new PromiseWorker(worker);
    }
    return _promiseWorker;
}

type Format = "svg" | "dot" | "json" | "dot_json" | "xdot_json";
type Engine = "circo" | "dot" | "fdp" | "neato" | "osage" | "patchwork" | "twopi";

export const graphviz = {
    layout(dotSource: string, outputFormat: Format = "svg", layoutEngine: Engine = "dot"): Promise<string> {
        return promiseWorker().postMessage({ dotSource, outputFormat, layoutEngine, wasmFolder: _wasmFolder });
    },
    circo(dotSource: string, outputFormat: Format = "svg"): Promise<string> {
        return this.layout(dotSource, outputFormat, "circo");
    },
    dot(dotSource: string, outputFormat: Format = "svg"): Promise<string> {
        return this.layout(dotSource, outputFormat, "dot");
    },
    fdp(dotSource: string, outputFormat: Format = "svg"): Promise<string> {
        return this.layout(dotSource, outputFormat, "fdp");
    },
    neato(dotSource: string, outputFormat: Format = "svg"): Promise<string> {
        return this.layout(dotSource, outputFormat, "neato");
    },
    osage(dotSource: string, outputFormat: Format = "svg"): Promise<string> {
        return this.layout(dotSource, outputFormat, "osage");
    },
    patchwork(dotSource: string, outputFormat: Format = "svg"): Promise<string> {
        return this.layout(dotSource, outputFormat, "patchwork");
    },
    twopi(dotSource: string, outputFormat: Format = "svg"): Promise<string> {
        return this.layout(dotSource, outputFormat, "twopi");
    }
};
