// @ts-ignore
import * as graphvizlib from "../build/graphviz/graphvizlib/graphvizlib";
import { loadWasm } from "./util";

type Format = "svg" | "dot" | "json" | "dot_json" | "xdot_json";
type Engine = "circo" | "dot" | "fdp" | "neato" | "osage" | "patchwork" | "twopi";

export const graphviz = {
    layout(dotSource: string, outputFormat: Format = "svg", layoutEngine: Engine = "dot"): Promise<string> {
        return loadWasm(graphvizlib).then(wasm => {
            return wasm.Main.prototype.layout(dotSource, outputFormat, layoutEngine);
        });
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
