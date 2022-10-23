import { interop } from "./util";
import { doFetch, scriptDir } from "./fetch-node";
interop.doFetch = doFetch;
interop.scriptDir = scriptDir;

export * from "./expat";
export * from "./graphviz";
export { wasmFolder } from "./util";
