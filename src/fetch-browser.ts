let _scriptDir = (globalThis.document?.currentScript as any)?.src ?? "";
export const scriptDir = _scriptDir.substring(0, _scriptDir.replace(/[?#].*/, "").lastIndexOf('/') + 1) + "../dist";
