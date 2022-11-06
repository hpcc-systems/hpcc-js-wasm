// @ts-ignore
import { loadWasm } from "./graphvizlib.wasm";

export type Format = "svg" | "dot" | "json" | "dot_json" | "xdot_json" | "plain" | "plain-ext";
export type Engine = "circo" | "dot" | "fdp" | "sfdp" | "neato" | "osage" | "patchwork" | "twopi";

export interface Image {
    path: string;
    width: string;
    height: string;
}

export interface File {
    path: string;
    data: string;
}

export interface Options {
    images?: Image[];
    files?: File[];
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

function createFiles(graphviz: any, _options?: Options) {
    const options = {
        images: [],
        files: [],
        ..._options
    };
    [...options.files, ...imagesToFiles(options.images)].forEach(file => graphviz.createFile(file.path, file.data));
}

export class Graphviz {

    private constructor(protected _module: any) {
    }

    static load(): Promise<Graphviz> {
        return loadWasm().then((module: any) => {
            return new Graphviz(module);
        });
    }

    graphvizVersion() {
        return this._module.Graphviz.prototype.version();
    }

    layout(dotSource: string, outputFormat: Format = "svg", layoutEngine: Engine = "dot", options?: Options): string {
        if (!dotSource) return "";
        const graphViz = new this._module.Graphviz(options?.yInvert ? 1 : 0, options?.nop ? options?.nop : 0);
        createFiles(graphViz, options);
        let retVal;
        let errorMsg;
        try {
            retVal = graphViz.layout(dotSource, outputFormat, layoutEngine);
        } catch (e) {
            errorMsg = this._module.Graphviz.prototype.lastError();
        };
        this._module.destroy(graphViz);
        if (retVal === undefined) {
            throw new Error(errorMsg);
        }
        return retVal;
    }

    circo(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "circo", options);
    }

    dot(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "dot", options);
    }

    fdp(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "fdp", options);
    }

    sfdp(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "sfdp", options);
    }

    neato(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "neato", options);
    }

    osage(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "osage", options);
    }

    patchwork(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "patchwork", options);
    }

    twopi(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "twopi", options);
    }
}

export function graphvizVersion() {
    console.warn("Deprecation Warning:  'graphvizVersion' will be refactored into 'Graphviz' in 2.0.0");
    return loadWasm().then((module: any) => {
        return module.Graphviz.prototype.version();
    });
}

export const graphviz = {
    layout(dotSource: string, outputFormat: Format = "svg", layoutEngine: Engine = "dot", options?: Options): Promise<string> {
        console.warn("Deprecation Warning:  'graphviz' will be replaced with 'Graphviz' in 2.0.0");
        if (!dotSource) return Promise.resolve("");
        return loadWasm().then((module: any) => {
            const graphViz = new module.Graphviz(options?.yInvert ? 1 : 0, options?.nop ? options?.nop : 0);
            createFiles(graphViz, options);
            let retVal;
            let errorMsg;
            try {
                retVal = graphViz.layout(dotSource, outputFormat, layoutEngine);
            } catch (e) {
                errorMsg = module.Graphviz.prototype.lastError();
            };
            module.destroy(graphViz);
            if (retVal === undefined) {
                throw new Error(errorMsg);
            }
            return retVal;
        });
    },
    circo(dotSource: string, outputFormat: Format = "svg", options?: Options): Promise<string> {
        return this.layout(dotSource, outputFormat, "circo", options);
    },
    dot(dotSource: string, outputFormat: Format = "svg", options?: Options): Promise<string> {
        return this.layout(dotSource, outputFormat, "dot", options);
    },
    fdp(dotSource: string, outputFormat: Format = "svg", options?: Options): Promise<string> {
        return this.layout(dotSource, outputFormat, "fdp", options);
    },
    sfdp(dotSource: string, outputFormat: Format = "svg", options?: Options): Promise<string> {
        return this.layout(dotSource, outputFormat, "sfdp", options);
    },
    neato(dotSource: string, outputFormat: Format = "svg", options?: Options): Promise<string> {
        return this.layout(dotSource, outputFormat, "neato", options);
    },
    osage(dotSource: string, outputFormat: Format = "svg", options?: Options): Promise<string> {
        return this.layout(dotSource, outputFormat, "osage", options);
    },
    patchwork(dotSource: string, outputFormat: Format = "svg", options?: Options): Promise<string> {
        return this.layout(dotSource, outputFormat, "patchwork", options);
    },
    twopi(dotSource: string, outputFormat: Format = "svg", options?: Options): Promise<string> {
        return this.layout(dotSource, outputFormat, "twopi", options);
    }
};

export class GraphvizSync {

    constructor(private _wasm: any) {
    }

    layout(dotSource: string, outputFormat: Format = "svg", layoutEngine: Engine = "dot", options?: Options): string {
        console.warn("Deprecation Warning:  'GraphvizSync' will be replaced with 'Graphviz' in 2.0.0");
        if (!dotSource) return "";
        const graphViz = new this._wasm.Graphviz(options?.yInvert ? 1 : 0, options?.nop ? options?.nop : 0);
        createFiles(graphViz, options);
        let retVal;
        let errorMsg;
        try {
            retVal = graphViz.layout(dotSource, outputFormat, layoutEngine);
        } catch (e) {
            errorMsg = this._wasm.Graphviz.prototype.lastError();
        };
        this._wasm.destroy(graphViz);
        if (retVal === undefined) {
            throw new Error(errorMsg);
        }
        return retVal;
    }

    circo(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "circo", options);
    }

    dot(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "dot", options);
    }

    fdp(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "fdp", options);
    }

    sfdp(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "sfdp", options);
    }

    neato(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "neato", options);
    }

    osage(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "osage", options);
    }

    patchwork(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "patchwork", options);
    }

    twopi(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "twopi", options);
    }
}

export function graphvizSync(wasmFolder?: string, wasmBinary?: ArrayBuffer): Promise<GraphvizSync> {
    return loadWasm().then((module: any) => new GraphvizSync(module));
}
