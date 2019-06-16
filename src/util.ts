const globalNS: any = new Function("return this;")();

let _wasmFolder: string | undefined = globalNS.__hpcc_wasmFolder || undefined;
export function wasmFolder(_?: string): string | undefined {
    if (_ === void 0) return _wasmFolder;
    const retVal: string | undefined = _wasmFolder;
    _wasmFolder = _;
    return retVal;
}

export function loadWasm(_wasmLib: any): Promise<any> {
    const wasmLib = _wasmLib.default || _wasmLib;
    //  Prevent double load ---
    if (!wasmLib.__hpcc_promise) {
        wasmLib.__hpcc_promise = new Promise(resolve => {
            wasmLib({
                locateFile: (path: string, prefix: string) => {
                    return `${wasmFolder() || prefix}/${path}`;
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
