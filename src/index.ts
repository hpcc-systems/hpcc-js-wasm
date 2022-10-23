import { interop } from "./util";
import { doFetch, scriptDir } from "./fetch-browser";
interop.doFetch = doFetch;
interop.scriptDir = scriptDir;

export * from "./expat";
export * from "./graphviz";
export { wasmFolder } from "./util";
