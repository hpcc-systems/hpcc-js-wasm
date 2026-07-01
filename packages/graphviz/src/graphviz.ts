// @ts-expect-error importing from a wasm file is resolved via a custom esbuild plugin
import load, { reset } from "../../../build/packages/graphviz/graphvizlib.wasm";
import type { MainModule, CGraph as CGraphWasm, CSubgraph as CSubgraphWasm } from "../types/graphvizlib.js";
import type {
    NodeDotAttr, NodeAttrs,
    EdgeDotAttr, EdgeAttrs,
    ClusterDotAttr, ClusterAttrs,
    GraphDotAttr, GraphAttrs as GraphAttrs
} from "./types.ts";

/**
 * Various graphic and data formats for end user, web, documents and other applications.  See [Output Formats](https://graphviz.gitlab.io/docs/outputs/) for more information.
 */
export type Format = "svg" | "svg_inline" | "dot" | "json" | "dot_json" | "xdot_json" | "plain" | "plain-ext" | "canon";

/**
 * An edge returned by graph-traversal methods.
 */
export interface EdgeInfo {
    /** The tail (source) node name. */
    tail: string;
    /** The head (target) node name. */
    head: string;
    /**
     * The cgraph edge key that distinguishes parallel edges.
     * Typically `""` for single (non-keyed) edges.
     */
    key: string;
}

/** @internal Parses a JSON string array returned by C++ traversal methods. */
function parseNames(json: string): string[] {
    return JSON.parse(json) as string[];
}

/** @internal Parses a flat JSON triple array `[tail,head,key,...]` into EdgeInfo[]. */
function parseEdges(json: string): EdgeInfo[] {
    const flat = JSON.parse(json) as string[];
    const result: EdgeInfo[] = [];
    for (let i = 0; i + 2 < flat.length; i += 3)
        result.push({ tail: flat[i]!, head: flat[i + 1]!, key: flat[i + 2]! });
    return result;
}

/**
 * Various algorithms for projecting abstract graphs into a space for visualization.  See [Layout Engines](https://graphviz.gitlab.io/docs/layouts/) for more details.
 */
export type Engine = "circo" | "dot" | "fdp" | "sfdp" | "neato" | "osage" | "patchwork" | "twopi" | "nop" | "nop2";

/**
 * Example:  Passing a web hosted Image to GraphViz:
 * ```ts
 * import { Graphviz } from "@hpcc-js/wasm-graphviz";
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

let g_graphviz: Promise<Graphviz> | undefined;

/**
 * The type of graph to create.
 * - `"directed"` – directed graph (`digraph`)
 * - `"undirected"` – undirected graph (`graph`)
 * - `"strict directed"` – directed graph that disallows parallel edges and self-loops
 * - `"strict undirected"` – undirected graph that disallows parallel edges and self-loops
 */
export type GraphType = "directed" | "undirected" | "strict directed" | "strict undirected";

/**
 * A subgraph (or cluster) inside a {@link Graph}.
 *
 * Obtain via {@link Graph.addSubgraph}.  All mutation methods return `this`
 * for chaining.  **Call {@link Subgraph.delete} (or use the `using` keyword)
 * when finished** to free the underlying WASM wrapper — the actual subgraph
 * data is owned by the parent {@link Graph} and is freed with it.
 *
 * Clusters are subgraphs whose name starts with `"cluster"`.  Layout engines
 * draw them as a bounded rectangle:
 *
 * ```ts
 * using cluster = graph.addSubgraph("cluster_0");
 * cluster
 *   .setAttr("label", "My Cluster")
 *   .setAttr("style", "filled")
 *   .setAttr("color", "lightblue")
 *   .addEdge("a", "b");
 * ```
 */
export class Subgraph {
    private _sg: CSubgraphWasm;

    /** @internal */
    constructor(sg: CSubgraphWasm) {
        this._sg = sg;
    }

    /**
     * Create (or find) a node and add it to this subgraph.
     */
    addNode(name: string): this {
        this._sg.addNode(name);
        return this;
    }

    /**
     * Create an edge inside this subgraph.  Both endpoints are created
     * automatically if they do not already exist.
     */
    addEdge(tail: string, head: string, key: string = ""): this {
        this._sg.addEdge(tail, head, key);
        return this;
    }

    /**
     * Remove a node from this subgraph only.  The node (and any edges
     * connecting it) remains in the root graph and all other subgraphs.
     * No-op if the node is not in this subgraph.
     */
    removeNode(name: string): this {
        this._sg.removeNode(name);
        return this;
    }

    /**
     * Remove a single edge from this subgraph only.  The edge remains in the
     * root graph and all other subgraphs.  No-op if the edge is not present.
     */
    removeEdge(tail: string, head: string, key: string = ""): this {
        this._sg.removeEdge(tail, head, key);
        return this;
    }

    /**
     * Set an attribute on the subgraph itself (e.g. `"label"`, `"style"`,
     * `"color"`, `"bgcolor"`).
     *
     * When `attr` is a known cluster attribute the value type is inferred
     * automatically.  A generic `string | number | boolean` fallback is
     * provided for custom or less-common attributes.
     */
    setAttr<K extends ClusterDotAttr>(attr: K, value: NonNullable<ClusterAttrs[K]>): this;
    setAttr(attr: string, value: string | number | boolean): this;
    setAttr(attr: string, value: unknown): this {
        this._sg.setAttr(attr, String(value));
        return this;
    }

    /**
     * Clear a subgraph-level attribute by resetting it to its default (empty)
     * value.  Equivalent to `setAttr(attr, "")`.
     */
    removeAttr(attr: string): this {
        return this.setAttr(attr, "");
    }

    /**
     * Set an attribute on a node inside this subgraph.
     *
     * When `attr` is a known node attribute the value type is inferred
     * automatically.  A generic `string | number | boolean` fallback is
     * provided for custom attributes.
     */
    setNodeAttr<K extends NodeDotAttr>(node: string, attr: K, value: NonNullable<NodeAttrs[K]>): this;
    setNodeAttr(node: string, attr: string, value: string | number | boolean): this;
    setNodeAttr(node: string, attr: string, value: unknown): this {
        this._sg.setNodeAttr(node, attr, String(value));
        return this;
    }

    /**
     * Clear a node attribute inside this subgraph by resetting it to its
     * default (empty) value.  Equivalent to `setNodeAttr(node, attr, "")`.
     */
    removeNodeAttr(node: string, attr: string): this {
        return this.setNodeAttr(node, attr, "");
    }

    /**
     * Set an attribute on an edge inside this subgraph (identified by
     * `tail`, `head`, and `key`).
     *
     * When `attr` is a known edge attribute the value type is inferred
     * automatically.  A generic `string | number | boolean` fallback is
     * provided for custom attributes.
     */
    setEdgeAttr<K extends EdgeDotAttr>(tail: string, head: string, key: string, attr: K, value: NonNullable<EdgeAttrs[K]>): this;
    setEdgeAttr(tail: string, head: string, key: string, attr: string, value: string | number | boolean): this;
    setEdgeAttr(tail: string, head: string, key: string, attr: string, value: unknown): this {
        this._sg.setEdgeAttr(tail, head, key, attr, String(value));
        return this;
    }

    /**
     * Clear an edge attribute inside this subgraph by resetting it to its
     * default (empty) value.  Equivalent to `setEdgeAttr(tail, head, key, attr, "")`.
     */
    removeEdgeAttr(tail: string, head: string, key: string, attr: string): this {
        return this.setEdgeAttr(tail, head, key, attr, "");
    }

    // ---- Existence checks -----------------------------------------------

    /**
     * Returns `true` if a node with the given name exists in this subgraph.
     */
    hasNode(name: string): boolean {
        return this._sg.hasNode(name);
    }

    /**
     * Returns `true` if an edge from `tail` to `head` exists in this subgraph.
     * Pass `key` to check for a specific parallel edge; omit (or pass `""`) to
     * check for any edge between the two nodes.
     */
    hasEdge(tail: string, head: string, key: string = ""): boolean {
        return this._sg.hasEdge(tail, head, key);
    }

    // ---- Count queries --------------------------------------------------

    /** Returns the number of nodes in this subgraph. */
    nodeCount(): number { return this._sg.nodeCount(); }

    /** Returns the number of edges in this subgraph. */
    edgeCount(): number { return this._sg.edgeCount(); }

    // ---- Attribute reading ----------------------------------------------

    /**
     * Returns the current value of a subgraph-level attribute, or `""` if
     * the attribute has not been set.
     */
    getAttr(attr: string): string {
        return this._sg.getAttr(attr);
    }

    /**
     * Returns the current value of the named attribute on a node in this
     * subgraph, or `""` if the node or attribute does not exist.
     */
    getNodeAttr(node: string, attr: string): string {
        return this._sg.getNodeAttr(node, attr);
    }

    /**
     * Returns the current value of the named attribute on an edge in this
     * subgraph, or `""` if the edge or attribute does not exist.
     * Pass `key = ""` for the first (or only) edge between `tail` and `head`.
     */
    getEdgeAttr(tail: string, head: string, key: string, attr: string): string {
        return this._sg.getEdgeAttr(tail, head, key, attr);
    }

    // ---- Graph traversal ------------------------------------------------

    /**
     * Returns the names of all nodes in this subgraph (in internal iteration
     * order).
     */
    nodeNames(): string[] {
        return parseNames(this._sg.nodeNames());
    }

    /**
     * Returns all edges in this subgraph.  Each unique edge is listed exactly
     * once.
     */
    edges(): EdgeInfo[] {
        return parseEdges(this._sg.edges());
    }

    /**
     * Returns the out-edges of the named node in this subgraph.  Returns `[]`
     * if the node does not exist.
     */
    outEdges(node: string): EdgeInfo[] {
        return parseEdges(this._sg.outEdges(node));
    }

    /**
     * Returns the in-edges of the named node in this subgraph.  Returns `[]`
     * if the node does not exist.
     */
    inEdges(node: string): EdgeInfo[] {
        return parseEdges(this._sg.inEdges(node));
    }

    /**
     * Returns all edges incident to the named node in this subgraph (both in
     * and out).  Returns `[]` if the node does not exist.
     */
    nodeEdges(node: string): EdgeInfo[] {
        return parseEdges(this._sg.nodeEdges(node));
    }

    /**
     * Release the WASM wrapper.  The subgraph data itself is freed when the
     * parent {@link Graph} is deleted.
     */
    delete(): void {
        this._sg.delete();
    }

    /** @internal – supports the `using` keyword (explicit resource management). */
    [Symbol.dispose](): void {
        this.delete();
    }
}

/**
 * A programmatic graph builder backed by the cgraph library.
 *
 * Obtain an instance via {@link Graphviz.createGraph} and call
 * {@link Graph.toDot} to serialise to a DOT string that can be passed to
 * {@link Graphviz.layout} (or any of its convenience wrappers).
 *
 * **Always call {@link Graph.delete} (or use the `using` keyword) when
 * finished** to release the underlying WASM memory.
 *
 * ```ts
 * const graphviz = await Graphviz.load();
 *
 * using graph = graphviz.createGraph("G");
 * graph.addNode("a");
 * graph.addNode("b");
 * graph.addEdge("a", "b");
 * graph.setNodeAttr("a", "color", "red");
 * graph.setEdgeAttr("a", "b", "", "label", "hello");
 * graph.setGraphAttr("rankdir", "LR");
 *
 * const svg = graphviz.dot(graph.toDot());
 * ```
 */
export class Graph {
    private _graph: CGraphWasm;
    private _module: MainModule;

    /** @internal */
    constructor(g: CGraphWasm, module: MainModule) {
        this._graph = g;
        this._module = module;
    }

    /**
     * Create a node.  If a node with this name already exists it is returned
     * unchanged.
     */
    addNode(name: string): this {
        this._graph.addNode(name);
        return this;
    }

    /**
     * Create an edge from `tail` to `head`.  Both nodes are created
     * automatically if they do not already exist.  `key` distinguishes
     * parallel edges between the same pair of nodes; omit (or pass `""`) for
     * an anonymous edge.
     */
    addEdge(tail: string, head: string, key: string = ""): this {
        this._graph.addEdge(tail, head, key);
        return this;
    }

    /**
     * Set a graph-level attribute (e.g. `"rankdir"`, `"label"`, `"bgcolor"`).
     *
     * When `attr` is a known graph attribute the value type is inferred
     * automatically.  A generic `string | number | boolean` fallback is
     * provided for custom or less-common attributes.
     */
    setGraphAttr<K extends GraphDotAttr>(attr: K, value: NonNullable<GraphAttrs[K]>): this;
    setGraphAttr(attr: string, value: string | number | boolean): this;
    setGraphAttr(attr: string, value: unknown): this {
        this._graph.setGraphAttr(attr, String(value));
        return this;
    }

    /**
     * Set an attribute on a named node (e.g. `"color"`, `"label"`, `"shape"`).
     * The node must exist; call {@link addNode} first if needed.
     *
     * When `attr` is a known node attribute the value type is inferred
     * automatically.  A generic `string | number | boolean` fallback is
     * provided for custom attributes.
     */
    setNodeAttr<K extends NodeDotAttr>(node: string, attr: K, value: NonNullable<NodeAttrs[K]>): this;
    setNodeAttr(node: string, attr: string, value: string | number | boolean): this;
    setNodeAttr(node: string, attr: string, value: unknown): this {
        this._graph.setNodeAttr(node, attr, String(value));
        return this;
    }

    /**
     * Set an attribute on an edge identified by `(tail, head, key)`.
     * Use the same `key` that was passed to {@link addEdge}; pass `""` for
     * anonymous edges.
     *
     * When `attr` is a known edge attribute the value type is inferred
     * automatically.  A generic `string | number | boolean` fallback is
     * provided for custom attributes.
     */
    setEdgeAttr<K extends EdgeDotAttr>(tail: string, head: string, key: string, attr: K, value: NonNullable<EdgeAttrs[K]>): this;
    setEdgeAttr(tail: string, head: string, key: string, attr: string, value: string | number | boolean): this;
    setEdgeAttr(tail: string, head: string, key: string, attr: string, value: unknown): this {
        this._graph.setEdgeAttr(tail, head, key, attr, String(value));
        return this;
    }

    /**
     * Remove a node and all its edges from the graph.  Removing from the root
     * graph also removes the node from every subgraph.
     * No-op if the node does not exist.
     */
    removeNode(name: string): this {
        this._graph.removeNode(name);
        return this;
    }

    /**
     * Remove a single edge identified by `(tail, head, key)`.
     * Pass `""` for `key` on anonymous edges.
     * No-op if the edge does not exist.
     */
    removeEdge(tail: string, head: string, key: string = ""): this {
        this._graph.removeEdge(tail, head, key);
        return this;
    }

    /**
     * Dissolve a subgraph / cluster boundary.  Nodes and edges that belonged
     * to the subgraph remain in the parent graph.
     * No-op if no subgraph with that name exists.
     */
    removeSubgraph(name: string): this {
        this._graph.removeSubgraph(name);
        return this;
    }

    /**
     * Clear a graph-level attribute by resetting it to its default (empty)
     * value.  Equivalent to `setGraphAttr(attr, "")`.
     */
    removeGraphAttr(attr: string): this {
        return this.setGraphAttr(attr, "");
    }

    /**
     * Clear a node attribute by resetting it to its default (empty) value.
     * Equivalent to `setNodeAttr(node, attr, "")`.
     */
    removeNodeAttr(node: string, attr: string): this {
        return this.setNodeAttr(node, attr, "");
    }

    /**
     * Clear an edge attribute by resetting it to its default (empty) value.
     * Equivalent to `setEdgeAttr(tail, head, key, attr, "")`.
     */
    removeEdgeAttr(tail: string, head: string, key: string, attr: string): this {
        return this.setEdgeAttr(tail, head, key, attr, "");
    }

    // ---- Existence checks -----------------------------------------------

    /**
     * Returns `true` if a node with the given name exists in the graph.
     */
    hasNode(name: string): boolean {
        return this._graph.hasNode(name);
    }

    /**
     * Returns `true` if an edge from `tail` to `head` exists in the graph.
     * Pass `key` to check for a specific parallel edge; omit (or pass `""`) to
     * check for any edge between the two nodes.
     */
    hasEdge(tail: string, head: string, key: string = ""): boolean {
        return this._graph.hasEdge(tail, head, key);
    }

    /**
     * Returns `true` if a subgraph with the given name exists.
     */
    hasSubgraph(name: string): boolean {
        return this._graph.hasSubgraph(name);
    }

    // ---- Count queries --------------------------------------------------

    /** Returns the number of nodes in the graph. */
    nodeCount(): number { return this._graph.nodeCount(); }

    /** Returns the number of edges in the graph. */
    edgeCount(): number { return this._graph.edgeCount(); }

    /** Returns the number of direct subgraphs of this graph. */
    subgraphCount(): number { return this._graph.subgraphCount(); }

    // ---- Attribute reading ----------------------------------------------

    /**
     * Returns the current value of a graph-level attribute, or `""` if the
     * attribute has not been set.
     */
    getGraphAttr(attr: string): string {
        return this._graph.getGraphAttr(attr);
    }

    /**
     * Returns the current value of the named attribute on a node, or `""` if
     * the node or attribute does not exist.
     */
    getNodeAttr(node: string, attr: string): string {
        return this._graph.getNodeAttr(node, attr);
    }

    /**
     * Returns the current value of the named attribute on an edge, or `""` if
     * the edge or attribute does not exist.
     * Pass `key = ""` for the first (or only) edge between `tail` and `head`.
     */
    getEdgeAttr(tail: string, head: string, key: string, attr: string): string {
        return this._graph.getEdgeAttr(tail, head, key, attr);
    }

    // ---- Graph traversal ------------------------------------------------

    /**
     * Returns the names of all nodes in the graph (in internal iteration
     * order).
     */
    nodeNames(): string[] {
        return parseNames(this._graph.nodeNames());
    }

    /**
     * Returns the names of all direct subgraphs.
     */
    subgraphNames(): string[] {
        return parseNames(this._graph.subgraphNames());
    }

    /**
     * Returns all edges in the graph.  Each unique edge is listed exactly
     * once.
     */
    edges(): EdgeInfo[] {
        return parseEdges(this._graph.edges());
    }

    /**
     * Returns the out-edges of the named node.  Returns `[]` if the node does
     * not exist.
     */
    outEdges(node: string): EdgeInfo[] {
        return parseEdges(this._graph.outEdges(node));
    }

    /**
     * Returns the in-edges of the named node.  Returns `[]` if the node does
     * not exist.
     */
    inEdges(node: string): EdgeInfo[] {
        return parseEdges(this._graph.inEdges(node));
    }

    /**
     * Returns all edges incident to the named node (both in and out).
     * Returns `[]` if the node does not exist.
     */
    nodeEdges(node: string): EdgeInfo[] {
        return parseEdges(this._graph.nodeEdges(node));
    }

    /**
     * Create (or return an existing) named subgraph.  Use a name beginning
     * with `"cluster"` to have layout engines render it as a bounded cluster.
     *
     * Returns a {@link Subgraph} wrapper.  **Call {@link Subgraph.delete} (or
     * use the `using` keyword) when finished** to free the WASM wrapper.  The
     * subgraph data itself is owned by this graph.
     *
     * ```ts
     * using cluster = graph.addSubgraph("cluster_0");
     * cluster.setAttr("label", "My Cluster").addEdge("a", "b");
     * ```
     */
    addSubgraph(name: string): Subgraph {
        // addSubgraph only returns null when the internal graph pointer is null,
        // which cannot happen while this Graph instance is alive.
        return new Subgraph(this._graph.addSubgraph(name)!);
    }

    /**
     * Look up an existing subgraph by name without creating a new one.
     * Returns a {@link Subgraph} wrapper if a subgraph with that name exists,
     * or `null` if it does not.  **Call {@link Subgraph.delete} (or use the
     * `using` keyword) when finished** to free the WASM wrapper.
     *
     * ```ts
     * using sg = graph.getSubgraph("cluster_0");
     * if (sg) {
     *     console.log(sg.nodeNames());
     * }
     * ```
     */
    getSubgraph(name: string): Subgraph | null {
        const sg = this._graph.getSubgraph(name);
        return sg ? new Subgraph(sg) : null;
    }

    /**
     * Render the graph directly to the specified format without first
     * serialising to DOT.  Equivalent to:
     * ```ts
     * graphviz.layout(graph.toDot(), outputFormat, layoutEngine, options)
     * ```
     * but avoids the DOT round-trip.
     *
     * @param outputFormat The output format (default `"svg"`).
     * @param layoutEngine The layout engine to use (default `"dot"`).
     * @param options       Optional images / extra files for the renderer.
     * @returns The rendered output as a string.
     */
    layout(outputFormat: Format = "svg", layoutEngine: Engine = "dot", options?: Options): string {
        if (options?.images?.length || options?.files?.length) {
            // Write images/files to the Emscripten FS before rendering.
            const helper = new this._module.CGraphviz(0, 0);
            try {
                createFiles(helper, options);
            } finally {
                helper.delete();
            }
        }
        let retVal = "";
        let errorMsg = "";
        try {
            retVal = this._graph.layout(outputFormat, layoutEngine);
        } catch (e: any) {
            errorMsg = (e as Error).message;
        }
        errorMsg = this._module.CGraphviz.lastError() || errorMsg;
        if (!retVal && errorMsg) {
            throw new Error(errorMsg);
        }
        return retVal;
    }

    /**
     * Serialise the graph to a DOT-language string.
     */
    toDot(): string {
        return this._graph.toDot();
    }

    /**
     * Release the underlying WASM object.  Must be called when the graph is
     * no longer needed (or use the `using` keyword with TypeScript ≥ 5.2).
     */
    delete(): void {
        this._graph.delete();
    }

    /** @internal – supports the `using` keyword (explicit resource management). */
    [Symbol.dispose](): void {
        this.delete();
    }
}

/**
 * The Graphviz layout algorithms take descriptions of graphs in a simple text language, and make diagrams in useful formats, such as images and SVG for web pages or display in an interactive graph browser.
 * 
 * Graphviz has many useful features for concrete diagrams, such as options for colors, fonts, tabular node layouts, line styles, hyperlinks, and custom shapes.
 * 
 * See [graphviz.org](https://graphviz.org/) for more details.
 *
 * ### Rendering from a DOT string
 * ```ts
 * import { Graphviz } from "@hpcc-js/wasm/graphviz";
 * 
 * const graphviz = await Graphviz.load();
 * 
 * const dot = "digraph G { Hello -> World }";
 * const svg = graphviz.dot(dot);
 * ```
 *
 * ### Programmatic graph construction
 * ```ts
 * import { Graphviz } from "@hpcc-js/wasm/graphviz";
 *
 * const graphviz = await Graphviz.load();
 *
 * using graph = graphviz.createGraph("G");
 * graph
 *   .addNode("a")
 *   .addNode("b")
 *   .addEdge("a", "b")
 *   .setNodeAttr("a", "color", "red")
 *   .setGraphAttr("rankdir", "LR");
 *
 * const svg = graph.layout(); // render without a DOT round-trip
 * ```
 * 
 * ### Online Demos
 * * https://raw.githack.com/hpcc-systems/hpcc-js-wasm/main/index.html
 * * https://observablehq.com/@gordonsmith/graphviz
 */
export class Graphviz {

    private _module: MainModule;

    private constructor(_module: MainModule) {
        this._module = _module;
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
        if (!g_graphviz) {
            g_graphviz = (load() as Promise<MainModule>).then((module) => new Graphviz(module));
        }
        return g_graphviz;
    }

    /**
     * Unloades the compiled wasm instance.
     */
    static unload() {
        reset();
        g_graphviz = undefined;
    }

    /**
     * @returns The Graphviz c++ version
     */
    version(): string {
        return this._module.CGraphviz.version();
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
        const graphViz = new this._module.CGraphviz(options?.yInvert ? 1 : 0, options?.nop ? options?.nop : 0);
        let retVal = "";
        let errorMsg = "";
        try {
            createFiles(graphViz, options);
            try {
                retVal = graphViz.layout(dotSource, outputFormat, layoutEngine);
            } catch (e: any) {
                errorMsg = e.message;
            };
            errorMsg = this._module.CGraphviz.lastError() || errorMsg;
        } finally {
            graphViz.delete();
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
        const graphViz = new this._module.CGraphviz();
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
            errorMsg = this._module.CGraphviz.lastError() || errorMsg;
        } finally {
            graphViz.delete();
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
        const graphViz = new this._module.CGraphviz();
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
            errorMsg = this._module.CGraphviz.lastError() || errorMsg;
        } finally {
            graphViz.delete();
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
        const graphViz = new this._module.CGraphviz();
        let retVal = "";
        let errorMsg = "";
        try {
            try {
                retVal = graphViz.unflatten(dotSource, maxMinlen, do_fans, chainLimit);
            } catch (e: any) {
                errorMsg = e.message;
            };
            errorMsg = this._module.CGraphviz.lastError() || errorMsg;
        } finally {
            graphViz.delete();
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

    /**
     * Programmatically create a graph using the cgraph library.
     *
     * Returns a {@link Graph} builder that lets you add nodes, edges, and
     * attributes without writing DOT source by hand.  Call
     * {@link Graph.toDot} to get the DOT string and pass it to
     * {@link layout} (or any convenience wrapper).
     *
     * **You must call {@link Graph.delete} when finished** to free the
     * underlying WASM memory, or use the `using` keyword (TypeScript ≥ 5.2).
     *
     * @param name  The graph name (default `"G"`).
     * @param type  The graph type (default `"directed"`).
     *
     * ```ts
     * using graph = graphviz.createGraph("G");
     * graph
     *   .addNode("a")
     *   .addNode("b")
     *   .addEdge("a", "b")
     *   .setNodeAttr("a", "color", "red")
     *   .setGraphAttr("rankdir", "LR");
     *
     * const svg = graphviz.dot(graph.toDot());
     * ```
     */
    createGraph(name: string = "G", type: GraphType = "directed"): Graph {
        const directed = !type.includes("undirected") ? 1 : 0;
        const strict = type.startsWith("strict") ? 1 : 0;
        return new Graph(new this._module.CGraph(name, directed, strict), this._module);
    }
}
