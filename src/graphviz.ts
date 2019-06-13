// @ts-ignore
import graphvizlib from "../build/graphviz/graphvizlib/graphvizlib";
import { loadWasm } from "./util";

type Format = "svg" | "dot" | "json" | "dot_json" | "xdot_json";
type Engine = "circo" | "dot" | "fdp" | "neato" | "osage" | "patchwork" | "twopi";

export const graphviz = {
    layout(dot: string, format: Format = "svg", engine: Engine = "dot"): Promise<string> {
        return loadWasm(graphvizlib).then(wasm => {
            return wasm.Main.prototype.layout(dot, format, engine);
        });
    }
};
