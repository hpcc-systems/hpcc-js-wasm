// @ts-ignore
import * as graphvizlib from "../build/graphviz/graphvizlib/graphvizlib";
import { loadWasm } from "./util";

type Format = "svg" | "dot" | "json" | "dot_json" | "xdot_json" | "plain" | "plain-ext";
type Engine = "circo" | "dot" | "fdp" | "sfdp" | "neato" | "osage" | "patchwork" | "twopi";

interface Image {
    path: string;
    width: string;
    height: string;
}

interface File {
    path: string;
    data: string;
}

interface Ext {
    images?: Image[];
    files?: File[];
    wasmFolder?: string;
    wasmBinary?: Uint8Array;
    yInvert?: boolean;
    nop?: number;
}

function imageToFile(image: Image): File {
    return {
        path: image.path,
        data: `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="${image.width}" height="${image.height}"></svg>`
    };
}

function imagesToFiles(images: Image[]) {
    return images.map(imageToFile);
}

function createFiles(graphviz: any, _ext?: Ext) {
    const ext = {
        images: [],
        files: [],
        ..._ext
    };
    [...ext.files, ...imagesToFiles(ext.images)].forEach(file => graphviz.createFile(file.path, file.data));
}

export function graphvizVersion(wasmFolder?: string, wasmBinary?: Uint8Array) {
    return loadWasm(graphvizlib, wasmFolder, wasmBinary).then(module => {
        return module.Graphviz.prototype.version();
    });
}
export const graphviz = {
    layout(dotSource: string, outputFormat: Format = "svg", layoutEngine: Engine = "dot", ext?: Ext): Promise<string> {
        if (!dotSource) return Promise.resolve("");
        return loadWasm(graphvizlib, ext?.wasmFolder, ext?.wasmBinary).then(module => {
            const graphViz = new module.Graphviz(ext?.yInvert !== undefined ? ext?.yInvert : false, ext?.nop !== undefined ? ext?.nop : 0);
            createFiles(graphViz, ext);
            const retVal = graphViz.layout(dotSource, outputFormat, layoutEngine);
            module.destroy(graphViz);
            if (!retVal) {
                throw new Error(module.Graphviz.prototype.lastError());
            }
            return retVal;
        });
    },
    circo(dotSource: string, outputFormat: Format = "svg", ext?: Ext): Promise<string> {
        return this.layout(dotSource, outputFormat, "circo", ext);
    },
    dot(dotSource: string, outputFormat: Format = "svg", ext?: Ext): Promise<string> {
        return this.layout(dotSource, outputFormat, "dot", ext);
    },
    fdp(dotSource: string, outputFormat: Format = "svg", ext?: Ext): Promise<string> {
        return this.layout(dotSource, outputFormat, "fdp", ext);
    },
    sfdp(dotSource: string, outputFormat: Format = "svg", ext?: Ext): Promise<string> {
        return this.layout(dotSource, outputFormat, "sfdp", ext);
    },
    neato(dotSource: string, outputFormat: Format = "svg", ext?: Ext): Promise<string> {
        return this.layout(dotSource, outputFormat, "neato", ext);
    },
    osage(dotSource: string, outputFormat: Format = "svg", ext?: Ext): Promise<string> {
        return this.layout(dotSource, outputFormat, "osage", ext);
    },
    patchwork(dotSource: string, outputFormat: Format = "svg", ext?: Ext): Promise<string> {
        return this.layout(dotSource, outputFormat, "patchwork", ext);
    },
    twopi(dotSource: string, outputFormat: Format = "svg", ext?: Ext): Promise<string> {
        return this.layout(dotSource, outputFormat, "twopi", ext);
    }
};

export class GraphvizSync {

    constructor(private _wasm: any) {
    }

    layout(dotSource: string, outputFormat: Format = "svg", layoutEngine: Engine = "dot", ext?: Ext): string {
        if (!dotSource) return "";
        const graphViz = new this._wasm.Graphviz(ext?.yInvert ? 1 : 0, ext?.nop ? ext?.nop : 0);
        createFiles(graphViz, ext);
        const retVal = graphViz.layout(dotSource, outputFormat, layoutEngine);
        this._wasm.destroy(graphViz);
        if (!retVal) {
            throw new Error(this._wasm.Graphviz.prototype.lastError());
        }
        return retVal;
    }

    circo(dotSource: string, outputFormat: Format = "svg", ext?: Ext): string {
        return this.layout(dotSource, outputFormat, "circo", ext);
    }

    dot(dotSource: string, outputFormat: Format = "svg", ext?: Ext): string {
        return this.layout(dotSource, outputFormat, "dot", ext);
    }

    fdp(dotSource: string, outputFormat: Format = "svg", ext?: Ext): string {
        return this.layout(dotSource, outputFormat, "fdp", ext);
    }

    sfdp(dotSource: string, outputFormat: Format = "svg", ext?: Ext): string {
        return this.layout(dotSource, outputFormat, "sfdp", ext);
    }

    neato(dotSource: string, outputFormat: Format = "svg", ext?: Ext): string {
        return this.layout(dotSource, outputFormat, "neato", ext);
    }

    osage(dotSource: string, outputFormat: Format = "svg", ext?: Ext): string {
        return this.layout(dotSource, outputFormat, "osage", ext);
    }

    patchwork(dotSource: string, outputFormat: Format = "svg", ext?: Ext): string {
        return this.layout(dotSource, outputFormat, "patchwork", ext);
    }

    twopi(dotSource: string, outputFormat: Format = "svg", ext?: Ext): string {
        return this.layout(dotSource, outputFormat, "twopi", ext);
    }
}

export function graphvizSync(wasmFolder?: string, wasmBinary?: Uint8Array): Promise<GraphvizSync> {
    return loadWasm(graphvizlib, wasmFolder, wasmBinary).then(wasm => new GraphvizSync(wasm));
}
