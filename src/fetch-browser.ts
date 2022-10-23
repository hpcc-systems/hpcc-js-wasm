let _scriptDir = (document?.currentScript as any)?.src ?? "";
export const scriptDir = _scriptDir.substring(0, _scriptDir.replace(/[?#].*/, "").lastIndexOf('/') + 1) + "../dist";

export async function doFetch(wasmUrl: string): Promise<ArrayBuffer> {
    return fetch(wasmUrl, { credentials: 'same-origin' } as any).then(response => {
        if (!response.ok) {
            throw "failed to load wasm binary file at '" + wasmUrl + "'";
        }
        return response.arrayBuffer();
    }).catch(e => {
        throw e;
    });
}
