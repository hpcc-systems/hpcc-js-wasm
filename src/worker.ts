import registerPromiseWorker from "promise-worker/register";
// @ts-ignore
import * as graphvizlib from "../build/graphviz/graphvizlib/graphvizlib";

export function loadWasm(_wasmLib: any, wasmFolder: string): Promise<any> {
    const wasmLib = _wasmLib.default || _wasmLib;

    //  Prevent double load ---
    if (!wasmLib.__hpcc_promise) {
        wasmLib.__hpcc_promise = new Promise(resolve => {
            wasmLib({
                locateFile: (path: string, prefix: string) => {
                    return `${wasmFolder}/${path}`;
                }
            }).then((instance: any) => {
                //  Not a real promise, remove "then" to prevent infinite loop  ---
                delete instance.then;
                resolve(instance);
            });
        });
    }
    return wasmLib.__hpcc_promise;
}

registerPromiseWorker(msg => {
    return loadWasm(graphvizlib, msg.wasmFolder).then(wasm => {
        return wasm.Main.prototype.layout(msg.dotSource, msg.outputFormat, msg.layoutEngine);
    });
});
