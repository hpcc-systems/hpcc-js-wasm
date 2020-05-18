// @ts-ignore
import * as graphvizlib from "../build/graphviz/graphvizlib/graphvizlib";
import { loadWasm } from "./util";

type Format = "svg" | "dot" | "json" | "dot_json" | "xdot_json";
type Engine = "circo" | "dot" | "fdp" | "neato" | "osage" | "patchwork" | "twopi";

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

function createFiles(wasm: any, _ext?: Ext) {
    const ext = {
        images: [],
        files: [],
        ..._ext
    };
    [...ext.files, ...imagesToFiles(ext.images)].forEach(file => wasm.Main.prototype.createFile(file.path, file.data));
}

export const graphviz = {
    layout(dotSource: string, outputFormat: Format = "svg", layoutEngine: Engine = "dot", ext?: Ext): Promise<string> {
        if (!dotSource) return Promise.resolve("");
        return loadWasm(graphvizlib, ext?.wasmFolder).then(wasm => {
            createFiles(wasm, ext);
            const retVal = wasm.Main.prototype.layout(dotSource, outputFormat, layoutEngine);
            if (!retVal) {
                throw new Error(wasm.Main.prototype.lastError());
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

class GraphvizSync {

    constructor(private _wasm: any) {
    }

    layout(dotSource: string, outputFormat: Format = "svg", layoutEngine: Engine = "dot", ext?: Ext): string {
        if (!dotSource) return "";
        createFiles(this._wasm, ext);
        const retVal = this._wasm.Main.prototype.layout(dotSource, outputFormat, layoutEngine);
        if (!retVal) {
            throw new Error(this._wasm.Main.prototype.lastError());
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

export function graphvizSync(wasmFolder?: string): Promise<GraphvizSync> {
    return loadWasm(graphvizlib, wasmFolder).then(wasm => new GraphvizSync(wasm));
}
