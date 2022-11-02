import { interop } from "./util";
import { doFetch, scriptDir } from "./fetch-node";
interop.doFetch = doFetch;
interop.scriptDir = scriptDir;

export * from "./index-common";
