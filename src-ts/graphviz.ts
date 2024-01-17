// @ts-ignore
import { loadWasm, unloadWasm } from "./graphvizlib.wasm.js";

/**
 * Various graphic and data formats for end user, web, documents and other applications.  See [Output Formats](https://graphviz.gitlab.io/docs/outputs/) for more information.
 */
export type Format = "svg" | "dot" | "json" | "dot_json" | "xdot_json" | "plain" | "plain-ext";

/**
 * Various algorithms for projecting abstract graphs into a space for visualization.  See [Layout Engines](https://graphviz.gitlab.io/docs/layouts/) for more details.
 */
export type Engine = "circo" | "dot" | "fdp" | "sfdp" | "neato" | "osage" | "patchwork" | "twopi" | "nop" | "nop2";

/**
 * Example:  Passing a web hosted Image to GraphViz:
 * ```ts
 * import { Graphviz } from "@hpcc-js/wasm/graphviz";
 * 
 * const graphviz = await Graphviz.load();
 * const svg = graphviz.layout('digraph { a[image="https://.../image.png"]; }', "svg", "dot", { 
 *    images: [{ 
 *        path: "https://.../image.png", 
 *            width: "272px", 
 *            height: "92px" 
 *    }] 
 * });
 * document.getElementById("placeholder").innerHTML = svg;
 * ```
 */
export interface Image {
    /**
     * Full URL to image
     */
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

/**
 * The Graphviz layout algorithms take descriptions of graphs in a simple text language, and make diagrams in useful formats, such as images and SVG for web pages or display in an interactive graph browser.
 * 
 * Graphviz has many useful features for concrete diagrams, such as options for colors, fonts, tabular node layouts, line styles, hyperlinks, and custom shapes.
 * 
 * See [graphviz.org](https://graphviz.org/) for more details.
 *
 * ```ts
 * import { Graphviz } from "@hpcc-js/wasm/graphviz";
 * 
 * const graphviz = await Graphviz.load();
 * 
 * const dot = "digraph G { Hello -> World }";
 * const svg = graphviz.dot(dot);
 * ```
 * 
 * ### Online Demos
 * * https://raw.githack.com/hpcc-systems/hpcc-js-wasm/trunk/index.html
 * * https://observablehq.com/@gordonsmith/graphviz
 */
export class Graphviz {

    private constructor(protected _module: any) {
    }

    /**
     * Compiles and instantiates the raw wasm.
     * 
     * ::: info
     * In general WebAssembly compilation is disallowed on the main thread if the buffer size is larger than 4KB, hence forcing `load` to be asynchronous;
     * :::
     * 
     * @returns A promise to an instance of the Graphviz class.
     */
    static load(): Promise<Graphviz> {
        return loadWasm().then((module: any) => {
            return new Graphviz(module);
        });
    }

    /**
     * Unloades the compiled wasm instance.
     */
    static unload() {
        unloadWasm();
    }

    /**
     * @returns The Graphviz c++ version
     */
    version(): string {
        return this._module.Graphviz.prototype.version();
    }

    /**
     * Performs layout for the supplied _dotSource_, see [The DOT Language](https://graphviz.gitlab.io/doc/info/lang.html) for specification.  
     * 
     * @param dotSource Required - graph definition in [DOT](https://graphviz.gitlab.io/doc/info/lang.html) language
     * @param outputFormat The format of the result.
     * @param layoutEngine The type of layout to perform.
     * @param options Advanced Options for images, files, yInvert and nop. 
     * @returns A string containing the calculated layout in the format specified by `outputFormat`
     */
    layout(dotSource: string, outputFormat: Format = "svg", layoutEngine: Engine = "dot", options?: Options): string {
        if (!dotSource) return "";
        const graphViz = new this._module.Graphviz(options?.yInvert ? 1 : 0, options?.nop ? options?.nop : 0);
        let retVal = "";
        let errorMsg = "";
        try {
            createFiles(graphViz, options);
            try {
                retVal = graphViz.layout(dotSource, outputFormat, layoutEngine);
            } catch (e: any) {
                errorMsg = e.message;
            };
            errorMsg = graphViz.lastError() || errorMsg;
        } finally {
            this._module.destroy(graphViz);
        }
        if (!retVal && errorMsg) {
            Graphviz.unload();
            throw new Error(errorMsg);
        }
        return retVal;
    }

    /**
      * acyclic is a filter that takes a directed graph as input and outputs a copy of the graph with sufficient edges reversed to make the graph acyclic. The reversed edge inherits all of the attributes of the original edge. The optional file argument specifies where the input graph is stored; by default.
      * 
      * @param dotSource Required - graph definition in [DOT](https://graphviz.gitlab.io/doc/info/lang.html) language
      * @param doWrite Enable output is produced, though the return value will indicate whether the graph is acyclic or not.
      * @param verbose Print information about whether the file is acyclic, has a cycle or is undirected.
      * @returns `{ acyclic: boolean, num_rev: number, outFile: string }` `acyclic` will be true if a cycle was found, `num_rev` will contain the number of reversed edges and `outFile` will (optionally) contain the output.
      */
    acyclic(dotSource: string, doWrite: boolean = false, verbose: boolean = false): { acyclic: boolean, num_rev: number, outFile: string } {
        if (!dotSource) return { acyclic: false, num_rev: 0, outFile: "" };
        const graphViz = new this._module.Graphviz();
        let acyclic: boolean = false;
        let num_rev: number = 0;
        let outFile: string = "";
        let errorMsg = "";
        try {
            try {
                acyclic = graphViz.acyclic(dotSource, doWrite, verbose);
                num_rev = graphViz.acyclic_num_rev;
                outFile = graphViz.acyclic_outFile;
            } catch (e: any) {
                errorMsg = e.message;
            };
            errorMsg = graphViz.lastError() || errorMsg;
        } finally {
            this._module.destroy(graphViz);
        }
        if (errorMsg) {
            Graphviz.unload();
            throw new Error(errorMsg);
        }
        return { acyclic, num_rev, outFile };
    }

    /**
      * tred computes the transitive reduction of directed graphs, and prints the resulting graphs to standard output.  This removes edges implied by transitivity. Nodes and subgraphs are not otherwise affected. The ‘‘meaning’’ and validity of the reduced graphs is application dependent. tred is particularly useful as a preprocessor to dot to reduce clutter in dense layouts.  Undirected graphs are silently ignored.
      * 
      * @param dotSource Required - graph definition in [DOT](https://graphviz.gitlab.io/doc/info/lang.html) language
      * @param verbose Print additional information.
      * @param printRemovedEdges Print information about removed edges.
      * @returns `{ out: string, err: string }`.
      */
    tred(dotSource: string, verbose: boolean = false, printRemovedEdges: boolean = false): { out: string, err: string } {
        if (!dotSource) return { out: "", err: "" };
        const graphViz = new this._module.Graphviz();
        let out: string = "";
        let err: string = "";
        let errorMsg = "";
        try {
            try {
                graphViz.tred(dotSource, verbose, printRemovedEdges);
                out = graphViz.tred_out;
                err = graphViz.tred_err;
            } catch (e: any) {
                errorMsg = e.message;
            };
            errorMsg = graphViz.lastError() || errorMsg;
        } finally {
            this._module.destroy(graphViz);
        }
        if (!out && errorMsg) {
            Graphviz.unload();
            throw new Error(errorMsg);
        }
        return { out, err };
    }

    /**
     * unflatten is a preprocessor to dot that is used to improve the aspect ratio of graphs having many leaves or disconnected nodes. The usual layout for such a graph is generally very wide or tall. unflatten inserts invisible edges or adjusts the minlen on edges to improve layout compaction.
     * 
     * @param dotSource Required - graph definition in [DOT](https://graphviz.gitlab.io/doc/info/lang.html) language
     * @param maxMinlen The minimum length of leaf edges is staggered between 1 and len (a small integer).
     * @param do_fans Enables the staggering of the -maxMinlen option to fanout nodes whose indegree and outdegree are both 1.  This helps with structures such as a -> \{w x y \} -> b. This option only works if the -maxMinlen flag is set.
     * @param chainLimit Form disconnected nodes into chains of up to len nodes.
     * @returns A string containing the "unflattened" dotSource.
     */
    unflatten(dotSource: string, maxMinlen: number = 0, do_fans: boolean = false, chainLimit: number = 0): string {
        if (!dotSource) return "";
        const graphViz = new this._module.Graphviz();
        let retVal = "";
        let errorMsg = "";
        try {
            try {
                retVal = graphViz.unflatten(dotSource, maxMinlen, do_fans, chainLimit);
            } catch (e: any) {
                errorMsg = e.message;
            };
            errorMsg = graphViz.lastError() || errorMsg;
        } finally {
            this._module.destroy(graphViz);
        }
        if (!retVal && errorMsg) {
            Graphviz.unload();
            throw new Error(errorMsg);
        }
        return retVal;
    }

    /**
     * Convenience function that performs the **circo** layout, is equivalent to `layout(dotSource, outputFormat, "circo");`.
     * 
     * @param dotSource Required - graph definition in [DOT](https://graphviz.gitlab.io/doc/info/lang.html) language
     * @param outputFormat The format of the result.
     * @param options Advanced Options for images, files, yInvert and nop. 
     * @returns A string containing the calculated layout in the format specified by `outputFormat`
     */
    circo(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "circo", options);
    }

    /**
     * Convenience function that performs the **dot** layout, is equivalent to `layout(dotSource, outputFormat, "dot");`.
     * 
     * @param dotSource Required - graph definition in [DOT](https://graphviz.gitlab.io/doc/info/lang.html) language
     * @param outputFormat The format of the result.
     * @param options Advanced Options for images, files, yInvert and nop. 
     * @returns A string containing the calculated layout in the format specified by `outputFormat`
     */
    dot(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "dot", options);
    }

    /**
     * Convenience function that performs the **fdp** layout, is equivalent to `layout(dotSource, outputFormat, "fdp");`.
     * 
     * @param dotSource Required - graph definition in [DOT](https://graphviz.gitlab.io/doc/info/lang.html) language
     * @param outputFormat The format of the result.
     * @param options Advanced Options for images, files, yInvert and nop. 
     * @returns A string containing the calculated layout in the format specified by `outputFormat`
     */
    fdp(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "fdp", options);
    }

    /**
     * Convenience function that performs the **sfdp** layout, is equivalent to `layout(dotSource, outputFormat, "sfdp");`.
     * 
     * @param dotSource Required - graph definition in [DOT](https://graphviz.gitlab.io/doc/info/lang.html) language
     * @param outputFormat The format of the result.
     * @param options Advanced Options for images, files, yInvert and nop. 
     * @returns A string containing the calculated layout in the format specified by `outputFormat`
     */
    sfdp(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "sfdp", options);
    }

    /**
     * Convenience function that performs the **neato** layout, is equivalent to `layout(dotSource, outputFormat, "neato");`.
     * 
     * @param dotSource Required - graph definition in [DOT](https://graphviz.gitlab.io/doc/info/lang.html) language
     * @param outputFormat The format of the result.
     * @param options Advanced Options for images, files, yInvert and nop. 
     * @returns A string containing the calculated layout in the format specified by `outputFormat`
     */
    neato(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "neato", options);
    }

    /**
     * Convenience function that performs the **osage** layout, is equivalent to `layout(dotSource, outputFormat, "osage");`.
     * 
     * @param dotSource Required - graph definition in [DOT](https://graphviz.gitlab.io/doc/info/lang.html) language
     * @param outputFormat The format of the result.
     * @param options Advanced Options for images, files, yInvert and nop. 
     * @returns A string containing the calculated layout in the format specified by `outputFormat`
     */
    osage(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "osage", options);
    }

    /**
     * Convenience function that performs the **patchwork** layout, is equivalent to `layout(dotSource, outputFormat, "patchwork");`.
     * 
     * @param dotSource Required - graph definition in [DOT](https://graphviz.gitlab.io/doc/info/lang.html) language
     * @param outputFormat The format of the result.
     * @param options Advanced Options for images, files, yInvert and nop. 
     * @returns A string containing the calculated layout in the format specified by `outputFormat`
     */
    patchwork(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "patchwork", options);
    }

    /**
     * Convenience function that performs the **twopi** layout, is equivalent to `layout(dotSource, outputFormat, "twopi");`.
     * 
     * @param dotSource Required - graph definition in [DOT](https://graphviz.gitlab.io/doc/info/lang.html) language
     * @param outputFormat The format of the result.
     * @param options Advanced Options for images, files, yInvert and nop. 
     * @returns A string containing the calculated layout in the format specified by `outputFormat`
     */
    twopi(dotSource: string, outputFormat: Format = "svg", options?: Options): string {
        return this.layout(dotSource, outputFormat, "twopi", options);
    }

    /**
     * Convenience function that performs the **nop** layout, is equivalent to `layout(dotSource, "dot", "nop");`.
     * 
     * @param dotSource Required - graph definition in [DOT](https://graphviz.gitlab.io/doc/info/lang.html) language
     * @returns A string containing the "pretty printed" dotSource.
     */
    nop(dotSource: string): string {
        return this.layout(dotSource, "dot", "nop");
    }

    /**
     * Convenience function that performs the **nop2** layout, is equivalent to `layout(dotSource, "dot", "nop2");`.
     * 
     * @param dotSource Required - graph definition in [DOT](https://graphviz.gitlab.io/doc/info/lang.html) language
     * @returns A string containing the "pretty printed" dotSource.
     */
    nop2(dotSource: string): string {
        return this.layout(dotSource, "dot", "nop2");
    }
}
