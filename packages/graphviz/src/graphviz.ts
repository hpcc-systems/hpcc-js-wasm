// @ts-expect-error importing from a wasm file is resolved via a custom esbuild plugin
import load, { reset } from "../../../build/packages/graphviz/graphvizlib.wasm";
import type { MainModule, CGraph as CGraphWasm, CSubgraph as CSubgraphWasm } from "../types/graphvizlib.js";
import type {
    NodeDotAttr, NodeAttrs,
    EdgeDotAttr, EdgeAttrs,
    ClusterDotAttr, ClusterAttrs,
    GraphDotAttr, GraphAttrs,
    Format, Engine
} from "./types.ts";

type AttrValues<T> = Partial<{ [K in keyof T]: NonNullable<T[K]> }>;

function applyAttrs<T extends object>(
    attrs: AttrValues<T> | undefined,
    apply: (attr: string, value: string | number | boolean) => void
): void {
    if (!attrs) {
        return;
    }
    for (const [attr, value] of Object.entries(attrs)) {
        if (value !== undefined) {
            apply(attr, value as string | number | boolean);
        }
    }
}

/**
 * An edge returned by graph-traversal methods.
 */
export interface EdgeInfo {
    /** The tail (source) node id. */
    tail: string;
    /** The head (target) node id. */
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

/** @internal Returns the C++ cgraph name for a subgraph id (always cluster-prefixed). */
function subgraphCppName(id: string): string {
    return `cluster_${id}`;
}

/** @internal Strips the cluster_ prefix from a C++ subgraph name to recover the user-facing id. */
function subgraphIdFromCppName(name: string): string {
    return name.startsWith("cluster_") ? name.slice("cluster_".length) : name;
}

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

export interface GraphInit {
    /** The graph id, used as the cgraph name and set as the `id` Graphviz attribute. */
    id?: string;
    type?: GraphType;
    attrs?: AttrValues<GraphAttrs>;
    htmlAttrs?: AttrValues<GraphAttrs>;
}

export interface NodeInit {
    /** The node id, used as the cgraph node name and set as the `id` Graphviz attribute. */
    id: string;
    attrs?: AttrValues<NodeAttrs>;
    htmlAttrs?: AttrValues<NodeAttrs>;
}

export interface EdgeInit {
    tail: string;
    head: string;
    key?: string;
    attrs?: AttrValues<EdgeAttrs>;
    htmlAttrs?: AttrValues<EdgeAttrs>;
}

export interface SubgraphInit {
    /**
     * The subgraph id.  The `cluster_` prefix is added automatically when
     * communicating with the underlying cgraph library; users never need to
     * include it.  The id is also set as the `id` Graphviz attribute on the
     * subgraph.
     */
    id: string;
    attrs?: AttrValues<ClusterAttrs>;
    htmlAttrs?: AttrValues<ClusterAttrs>;
}

export type ClusterInit = SubgraphInit;

/**
 * A subgraph (cluster) inside a {@link Graph}.
 *
 * Obtain via {@link Graph.addSubgraph} or {@link Subgraph.addSubgraph}.  All mutation methods return `this`
 * for chaining.  **Call {@link Subgraph.delete} (or use the `using` keyword)
 * when finished** to free the underlying WASM wrapper — the actual subgraph
 * data is owned by the parent {@link Graph} and is freed with it.
 *
 * Every subgraph is automatically rendered as a cluster (the `cluster_` prefix
 * is added to the id when communicating with the underlying cgraph library).
 * The `id` Graphviz attribute on the subgraph is set to the user-supplied id
 * (without the prefix):
 *
 * ```ts
 * using cluster = graph.addSubgraph("0");
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
     * Create (or find) a node and add it to this subgraph.  The node's `id`
     * Graphviz attribute is automatically set to match `id`.
     */
    addNode(id: string, attrs?: AttrValues<NodeAttrs>, htmlAttrs?: AttrValues<NodeAttrs>): this;
    addNode(init: NodeInit): this;
    addNode(idOrInit: string | NodeInit, nodeAttrs?: AttrValues<NodeAttrs>, nodeHtmlAttrs?: AttrValues<NodeAttrs>): this {
        const init = typeof idOrInit === "string" ? { id: idOrInit, attrs: nodeAttrs, htmlAttrs: nodeHtmlAttrs } : idOrInit;
        const { id, attrs, htmlAttrs } = init;

        this._sg.addNode(id);
        this.setNodeAttr(id, "id", id);
        applyAttrs<NodeAttrs>(attrs, (attr, value) => this.setNodeAttr(id, attr, value));
        applyAttrs<NodeAttrs>(htmlAttrs, (attr, value) => this.setNodeHtmlAttr(id, attr, value));
        return this;
    }

    /** Alias for {@link addNode}. */
    addVertex(id: string, attrs?: AttrValues<NodeAttrs>, htmlAttrs?: AttrValues<NodeAttrs>): this;
    addVertex(init: NodeInit): this;
    addVertex(idOrInit: string | NodeInit, nodeAttrs?: AttrValues<NodeAttrs>, nodeHtmlAttrs?: AttrValues<NodeAttrs>): this {
        return this.addNode(idOrInit as any, nodeAttrs, nodeHtmlAttrs);
    }

    /**
     * Create an edge inside this subgraph.  Both endpoints are created
     * automatically if they do not already exist, and their `id` Graphviz
     * attribute is set to their node id.
     */
    addEdge(tail: string, head: string, attrs?: AttrValues<EdgeAttrs>, htmlAttrs?: AttrValues<EdgeAttrs>): this;
    addEdge(tail: string, head: string, key: string, attrs?: AttrValues<EdgeAttrs>, htmlAttrs?: AttrValues<EdgeAttrs>): this;
    addEdge(init: EdgeInit): this;
    addEdge(tailOrInit: string | EdgeInit, head?: string, keyOrAttrs: string | AttrValues<EdgeAttrs> = "", attrsOrHtmlAttrs?: AttrValues<EdgeAttrs>, maybeHtmlAttrs?: AttrValues<EdgeAttrs>): this {
        const init = typeof tailOrInit === "string"
            ? typeof keyOrAttrs === "string"
                ? { tail: tailOrInit, head: head!, key: keyOrAttrs, attrs: attrsOrHtmlAttrs, htmlAttrs: maybeHtmlAttrs }
                : { tail: tailOrInit, head: head!, attrs: keyOrAttrs, htmlAttrs: attrsOrHtmlAttrs }
            : tailOrInit;
        const { tail, head: resolvedHead, key: resolvedKey = "", attrs, htmlAttrs } = init;

        this._sg.addEdge(tail, resolvedHead, resolvedKey);
        this.setNodeAttr(tail, "id", tail);
        this.setNodeAttr(resolvedHead, "id", resolvedHead);
        applyAttrs<EdgeAttrs>(attrs, (attr, value) => this.setEdgeAttr(tail, resolvedHead, resolvedKey, attr, value));
        applyAttrs<EdgeAttrs>(htmlAttrs, (attr, value) => this.setEdgeHtmlAttr(tail, resolvedHead, resolvedKey, attr, value));
        return this;
    }

    /**
     * Create (or return an existing) subgraph under this subgraph.  The
     * `cluster_` prefix is added to `id` internally so that layout engines
     * render it as a bounded cluster.  The subgraph's `id` Graphviz attribute
     * is set to the user-supplied `id` (without the prefix).
     */
    addSubgraph(id: string, attrs?: AttrValues<ClusterAttrs>, htmlAttrs?: AttrValues<ClusterAttrs>): Subgraph;
    addSubgraph(init: SubgraphInit): Subgraph;
    addSubgraph(idOrInit: string | SubgraphInit, attrs?: AttrValues<ClusterAttrs>, htmlAttrs?: AttrValues<ClusterAttrs>): Subgraph {
        const init = typeof idOrInit === "string" ? { id: idOrInit, attrs, htmlAttrs } : idOrInit;
        // addSubgraph only returns null when the internal subgraph pointer is null,
        // which cannot happen while this Subgraph instance is alive.
        return new Subgraph(this._sg.addSubgraph(subgraphCppName(init.id))!).applyInit(init);
    }

    applyInit(init: SubgraphInit): this {
        this.setAttr("id", init.id);
        applyAttrs<ClusterAttrs>(init.attrs, (attr, value) => this.setAttr(attr, value));
        applyAttrs<ClusterAttrs>(init.htmlAttrs, (attr, value) => this.setHtmlAttr(attr, value));
        return this;
    }

    /**
     * Remove a node from this subgraph only.  The node (and any edges
     * connecting it) remains in the root graph and all other subgraphs.
     * No-op if the node is not in this subgraph.
     */
    removeNode(id: string): this {
        this._sg.removeNode(id);
        return this;
    }

    /** Alias for {@link removeNode}. */
    removeVertex(id: string): this {
        return this.removeNode(id);
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
     * `"color"`, `"bgcolor"`).  See the official Graphviz
     * [attribute reference](https://graphviz.org/docs/attrs/) for supported
     * attributes and values.
     *
     * When `attr` is a known cluster attribute the value type is inferred
     * automatically.  A generic `string | number | boolean` fallback is
     * provided for custom or less-common attributes.  Omit `value` to reset
     * the attribute to Graphviz's default empty value.  `defaultValue` is
     * passed to Graphviz as the default for this attribute if it has not
     * already been declared.
     */
    setAttr<K extends ClusterDotAttr>(attr: K, value?: NonNullable<ClusterAttrs[K]>, defaultValue?: string | number | boolean): this;
    setAttr(attr: string, value?: string | number | boolean, defaultValue?: string | number | boolean): this;
    setAttr(attr: string, value: unknown = "", defaultValue?: unknown): this {
        if (defaultValue === undefined) {
            this._sg.setAttr(attr, String(value));
        } else {
            this._sg.setAttr(attr, String(value), String(defaultValue));
        }
        return this;
    }

    setHtmlAttr<K extends ClusterDotAttr>(attr: K, value: NonNullable<ClusterAttrs[K]>, defaultValue?: string | number | boolean): this;
    setHtmlAttr(attr: string, value: string | number | boolean, defaultValue?: string | number | boolean): this;
    setHtmlAttr(attr: string, value: unknown, defaultValue?: unknown): this {
        if (defaultValue === undefined) {
            this._sg.setHtmlAttr(attr, String(value));
        } else {
            this._sg.setHtmlAttr(attr, String(value), String(defaultValue));
        }
        return this;
    }

    setDefaultAttr<K extends ClusterDotAttr>(attr: K, value: NonNullable<ClusterAttrs[K]>): this;
    setDefaultAttr(attr: string, value: string | number | boolean): this;
    setDefaultAttr(attr: string, value: unknown): this {
        this._sg.setDefaultAttr(attr, String(value));
        return this;
    }

    setDefaultHtmlAttr<K extends ClusterDotAttr>(attr: K, value: NonNullable<ClusterAttrs[K]>): this;
    setDefaultHtmlAttr(attr: string, value: string | number | boolean): this;
    setDefaultHtmlAttr(attr: string, value: unknown): this {
        this._sg.setDefaultHtmlAttr(attr, String(value));
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
     * provided for custom attributes.  Omit `value` to reset the attribute to
     * Graphviz's default empty value.  `defaultValue` is passed to Graphviz as
     * the default for this attribute if it has not already been declared.
     */
    setNodeAttr<K extends NodeDotAttr>(node: string, attr: K, value?: NonNullable<NodeAttrs[K]>, defaultValue?: string | number | boolean): this;
    setNodeAttr(node: string, attr: string, value?: string | number | boolean, defaultValue?: string | number | boolean): this;
    setNodeAttr(node: string, attr: string, value: unknown = "", defaultValue?: unknown): this {
        if (defaultValue === undefined) {
            this._sg.setNodeAttr(node, attr, String(value));
        } else {
            this._sg.setNodeAttr(node, attr, String(value), String(defaultValue));
        }
        return this;
    }

    /** Alias for {@link setNodeAttr}. */
    setVertexAttr<K extends NodeDotAttr>(node: string, attr: K, value?: NonNullable<NodeAttrs[K]>, defaultValue?: string | number | boolean): this;
    setVertexAttr(node: string, attr: string, value?: string | number | boolean, defaultValue?: string | number | boolean): this;
    setVertexAttr(node: string, attr: string, value: unknown = "", defaultValue?: unknown): this {
        return this.setNodeAttr(node, attr, value as any, defaultValue as any);
    }

    setNodeHtmlAttr<K extends NodeDotAttr>(node: string, attr: K, value: NonNullable<NodeAttrs[K]>, defaultValue?: string | number | boolean): this;
    setNodeHtmlAttr(node: string, attr: string, value: string | number | boolean, defaultValue?: string | number | boolean): this;
    setNodeHtmlAttr(node: string, attr: string, value: unknown, defaultValue?: unknown): this {
        if (defaultValue === undefined) {
            this._sg.setNodeHtmlAttr(node, attr, String(value));
        } else {
            this._sg.setNodeHtmlAttr(node, attr, String(value), String(defaultValue));
        }
        return this;
    }

    /** Alias for {@link setNodeHtmlAttr}. */
    setVertexHtmlAttr<K extends NodeDotAttr>(node: string, attr: K, value: NonNullable<NodeAttrs[K]>, defaultValue?: string | number | boolean): this;
    setVertexHtmlAttr(node: string, attr: string, value: string | number | boolean, defaultValue?: string | number | boolean): this;
    setVertexHtmlAttr(node: string, attr: string, value: unknown, defaultValue?: unknown): this {
        return this.setNodeHtmlAttr(node, attr, value as any, defaultValue as any);
    }

    setDefaultNodeAttr<K extends NodeDotAttr>(attr: K, value: NonNullable<NodeAttrs[K]>): this;
    setDefaultNodeAttr(attr: string, value: string | number | boolean): this;
    setDefaultNodeAttr(attr: string, value: unknown): this {
        this._sg.setDefaultNodeAttr(attr, String(value));
        return this;
    }

    /** Alias for {@link setDefaultNodeAttr}. */
    setDefaultVertexAttr<K extends NodeDotAttr>(attr: K, value: NonNullable<NodeAttrs[K]>): this;
    setDefaultVertexAttr(attr: string, value: string | number | boolean): this;
    setDefaultVertexAttr(attr: string, value: unknown): this {
        return this.setDefaultNodeAttr(attr, value as any);
    }

    setDefaultNodeHtmlAttr<K extends NodeDotAttr>(attr: K, value: NonNullable<NodeAttrs[K]>): this;
    setDefaultNodeHtmlAttr(attr: string, value: string | number | boolean): this;
    setDefaultNodeHtmlAttr(attr: string, value: unknown): this {
        this._sg.setDefaultNodeHtmlAttr(attr, String(value));
        return this;
    }

    /** Alias for {@link setDefaultNodeHtmlAttr}. */
    setDefaultVertexHtmlAttr<K extends NodeDotAttr>(attr: K, value: NonNullable<NodeAttrs[K]>): this;
    setDefaultVertexHtmlAttr(attr: string, value: string | number | boolean): this;
    setDefaultVertexHtmlAttr(attr: string, value: unknown): this {
        return this.setDefaultNodeHtmlAttr(attr, value as any);
    }

    /**
     * Clear a node attribute inside this subgraph by resetting it to its
     * default (empty) value.  Equivalent to `setNodeAttr(node, attr, "")`.
     */
    removeNodeAttr(node: string, attr: string): this {
        return this.setNodeAttr(node, attr, "");
    }

    /** Alias for {@link removeNodeAttr}. */
    removeVertexAttr(node: string, attr: string): this {
        return this.removeNodeAttr(node, attr);
    }

    /**
     * Set an attribute on an edge inside this subgraph (identified by
     * `tail`, `head`, and `key`).
     *
     * When `attr` is a known edge attribute the value type is inferred
     * automatically.  A generic `string | number | boolean` fallback is
     * provided for custom attributes.  Omit `value` to reset the attribute to
     * Graphviz's default empty value.  `defaultValue` is passed to Graphviz as
     * the default for this attribute if it has not already been declared.
     */
    setEdgeAttr<K extends EdgeDotAttr>(tail: string, head: string, key: string, attr: K, value?: NonNullable<EdgeAttrs[K]>, defaultValue?: string | number | boolean): this;
    setEdgeAttr(tail: string, head: string, key: string, attr: string, value?: string | number | boolean, defaultValue?: string | number | boolean): this;
    setEdgeAttr(tail: string, head: string, key: string, attr: string, value: unknown = "", defaultValue?: unknown): this {
        if (defaultValue === undefined) {
            this._sg.setEdgeAttr(tail, head, key, attr, String(value));
        } else {
            this._sg.setEdgeAttr(tail, head, key, attr, String(value), String(defaultValue));
        }
        return this;
    }

    setEdgeHtmlAttr<K extends EdgeDotAttr>(tail: string, head: string, key: string, attr: K, value: NonNullable<EdgeAttrs[K]>, defaultValue?: string | number | boolean): this;
    setEdgeHtmlAttr(tail: string, head: string, key: string, attr: string, value: string | number | boolean, defaultValue?: string | number | boolean): this;
    setEdgeHtmlAttr(tail: string, head: string, key: string, attr: string, value: unknown, defaultValue?: unknown): this {
        if (defaultValue === undefined) {
            this._sg.setEdgeHtmlAttr(tail, head, key, attr, String(value));
        } else {
            this._sg.setEdgeHtmlAttr(tail, head, key, attr, String(value), String(defaultValue));
        }
        return this;
    }

    setDefaultEdgeAttr<K extends EdgeDotAttr>(attr: K, value: NonNullable<EdgeAttrs[K]>): this;
    setDefaultEdgeAttr(attr: string, value: string | number | boolean): this;
    setDefaultEdgeAttr(attr: string, value: unknown): this {
        this._sg.setDefaultEdgeAttr(attr, String(value));
        return this;
    }

    setDefaultEdgeHtmlAttr<K extends EdgeDotAttr>(attr: K, value: NonNullable<EdgeAttrs[K]>): this;
    setDefaultEdgeHtmlAttr(attr: string, value: string | number | boolean): this;
    setDefaultEdgeHtmlAttr(attr: string, value: unknown): this {
        this._sg.setDefaultEdgeHtmlAttr(attr, String(value));
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
     * Returns `true` if a node with the given id exists in this subgraph.
     */
    hasNode(id: string): boolean {
        return this._sg.hasNode(id);
    }

    /** Alias for {@link hasNode}. */
    hasVertex(id: string): boolean {
        return this.hasNode(id);
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

    /** Alias for {@link nodeCount}. */
    vertexCount(): number { return this.nodeCount(); }

    /** Returns the number of edges in this subgraph. */
    edgeCount(): number { return this._sg.edgeCount(); }

    /** Returns the degree of the node with the given id in this subgraph. */
    nodeDegree(node: string, inDegree: number = 1, outDegree: number = 1): number {
        return this._sg.nodeDegree(node, inDegree, outDegree);
    }

    /** Alias for {@link nodeDegree}. */
    vertexDegree(node: string, inDegree: number = 1, outDegree: number = 1): number {
        return this.nodeDegree(node, inDegree, outDegree);
    }

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

    /** Alias for {@link getNodeAttr}. */
    getVertexAttr(node: string, attr: string): string {
        return this.getNodeAttr(node, attr);
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
     * Returns the ids of all nodes in this subgraph (in internal iteration
     * order).
     */
    nodeNames(): string[] {
        return parseNames(this._sg.nodeNames());
    }

    /** Alias for {@link nodeNames}. */
    vertexNames(): string[] {
        return this.nodeNames();
    }

    /**
     * Returns all edges in this subgraph.  Each unique edge is listed exactly
     * once.
     */
    edges(): EdgeInfo[] {
        return parseEdges(this._sg.edges());
    }

    /**
     * Returns the out-edges of the node with the given id in this subgraph.
     * Returns `[]` if the node does not exist.
     */
    outEdges(node: string): EdgeInfo[] {
        return parseEdges(this._sg.outEdges(node));
    }

    /**
     * Returns the in-edges of the node with the given id in this subgraph.
     * Returns `[]` if the node does not exist.
     */
    inEdges(node: string): EdgeInfo[] {
        return parseEdges(this._sg.inEdges(node));
    }

    /**
     * Returns all edges incident to the node with the given id in this
     * subgraph (both in and out).  Returns `[]` if the node does not exist.
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
 * const svg = graph.layout(); // render without a DOT round-trip
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

    private ensureDefaultFonts(includeNodeAndEdgeDefaults: boolean): void {
        if (this.getGraphAttr("fontname") === "") {
            this.setGraphAttr("fontname", "Arial");
        }
        this.setDefaultGraphAttr("fontname", "Arial");
        if (includeNodeAndEdgeDefaults) {
            this.setDefaultNodeAttr("fontname", "Arial");
            this.setDefaultEdgeAttr("fontname", "Arial");
        }
    }

    /**
     * Create a node with the given `id`.  If a node with this id already
     * exists it is returned unchanged.  The node's `id` Graphviz attribute is
     * automatically set to match.
     */
    addNode(id: string, attrs?: AttrValues<NodeAttrs>, htmlAttrs?: AttrValues<NodeAttrs>): this;
    addNode(init: NodeInit): this;
    addNode(idOrInit: string | NodeInit, nodeAttrs?: AttrValues<NodeAttrs>, nodeHtmlAttrs?: AttrValues<NodeAttrs>): this {
        const init = typeof idOrInit === "string" ? { id: idOrInit, attrs: nodeAttrs, htmlAttrs: nodeHtmlAttrs } : idOrInit;
        const { id, attrs, htmlAttrs } = init;

        this._graph.addNode(id);
        this.setNodeAttr(id, "id", id);
        applyAttrs<NodeAttrs>(attrs, (attr, value) => this.setNodeAttr(id, attr, value));
        applyAttrs<NodeAttrs>(htmlAttrs, (attr, value) => this.setNodeHtmlAttr(id, attr, value));
        return this;
    }

    /** Alias for {@link addNode}. */
    addVertex(id: string, attrs?: AttrValues<NodeAttrs>, htmlAttrs?: AttrValues<NodeAttrs>): this;
    addVertex(init: NodeInit): this;
    addVertex(idOrInit: string | NodeInit, nodeAttrs?: AttrValues<NodeAttrs>, nodeHtmlAttrs?: AttrValues<NodeAttrs>): this {
        return this.addNode(idOrInit as any, nodeAttrs, nodeHtmlAttrs);
    }

    /**
     * Create an edge from `tail` to `head`.  Both nodes are created
     * automatically if they do not already exist, and their `id` Graphviz
     * attribute is set to their node id.  `key` distinguishes parallel edges
     * between the same pair of nodes; omit (or pass `""`) for an anonymous edge.
     */
    addEdge(tail: string, head: string, attrs?: AttrValues<EdgeAttrs>, htmlAttrs?: AttrValues<EdgeAttrs>): this;
    addEdge(tail: string, head: string, key: string, attrs?: AttrValues<EdgeAttrs>, htmlAttrs?: AttrValues<EdgeAttrs>): this;
    addEdge(init: EdgeInit): this;
    addEdge(tailOrInit: string | EdgeInit, head?: string, keyOrAttrs: string | AttrValues<EdgeAttrs> = "", attrsOrHtmlAttrs?: AttrValues<EdgeAttrs>, maybeHtmlAttrs?: AttrValues<EdgeAttrs>): this {
        const init = typeof tailOrInit === "string"
            ? typeof keyOrAttrs === "string"
                ? { tail: tailOrInit, head: head!, key: keyOrAttrs, attrs: attrsOrHtmlAttrs, htmlAttrs: maybeHtmlAttrs }
                : { tail: tailOrInit, head: head!, attrs: keyOrAttrs, htmlAttrs: attrsOrHtmlAttrs }
            : tailOrInit;
        const { tail, head: resolvedHead, key: resolvedKey = "", attrs, htmlAttrs } = init;

        this._graph.addEdge(tail, resolvedHead, resolvedKey);
        this.setNodeAttr(tail, "id", tail);
        this.setNodeAttr(resolvedHead, "id", resolvedHead);
        applyAttrs<EdgeAttrs>(attrs, (attr, value) => this.setEdgeAttr(tail, resolvedHead, resolvedKey, attr, value));
        applyAttrs<EdgeAttrs>(htmlAttrs, (attr, value) => this.setEdgeHtmlAttr(tail, resolvedHead, resolvedKey, attr, value));
        return this;
    }

    applyInit(init: GraphInit): this {
        this.ensureDefaultFonts(true);
        if (init.id !== undefined) {
            this.setGraphAttr("id", init.id);
        }
        applyAttrs<GraphAttrs>(init.attrs, (attr, value) => this.setGraphAttr(attr, value));
        applyAttrs<GraphAttrs>(init.htmlAttrs, (attr, value) => this.setGraphHtmlAttr(attr, value));
        return this;
    }

    /**
     * Replace this graph with one parsed from DOT source using Graphviz cgraph
     * reading support.
     */
    read(dotSource: string): this {
        if (!this._graph.read(dotSource)) {
            throw new Error("Invalid DOT source");
        }
        this.ensureDefaultFonts(false);
        return this;
    }

    /**
     * Set a graph-level attribute (e.g. `"rankdir"`, `"label"`, `"bgcolor"`).
     * See the official Graphviz [attribute reference](https://graphviz.org/docs/attrs/)
     * for supported attributes and values.
     *
     * When `attr` is a known graph attribute the value type is inferred
     * automatically.  A generic `string | number | boolean` fallback is
     * provided for custom or less-common attributes.  Omit `value` to reset
     * the attribute to Graphviz's default empty value.  `defaultValue` is
     * passed to Graphviz as the default for this attribute if it has not
     * already been declared.
     */
    setGraphAttr<K extends GraphDotAttr>(attr: K, value?: NonNullable<GraphAttrs[K]>, defaultValue?: string | number | boolean): this;
    setGraphAttr(attr: string, value?: string | number | boolean, defaultValue?: string | number | boolean): this;
    setGraphAttr(attr: string, value: unknown = "", defaultValue?: unknown): this {
        if (defaultValue === undefined) {
            this._graph.setGraphAttr(attr, String(value));
        } else {
            this._graph.setGraphAttr(attr, String(value), String(defaultValue));
        }
        return this;
    }

    setGraphHtmlAttr<K extends GraphDotAttr>(attr: K, value: NonNullable<GraphAttrs[K]>, defaultValue?: string | number | boolean): this;
    setGraphHtmlAttr(attr: string, value: string | number | boolean, defaultValue?: string | number | boolean): this;
    setGraphHtmlAttr(attr: string, value: unknown, defaultValue?: unknown): this {
        if (defaultValue === undefined) {
            this._graph.setGraphHtmlAttr(attr, String(value));
        } else {
            this._graph.setGraphHtmlAttr(attr, String(value), String(defaultValue));
        }
        return this;
    }

    setDefaultGraphAttr<K extends GraphDotAttr>(attr: K, value: NonNullable<GraphAttrs[K]>): this;
    setDefaultGraphAttr(attr: string, value: string | number | boolean): this;
    setDefaultGraphAttr(attr: string, value: unknown): this {
        this._graph.setDefaultGraphAttr(attr, String(value));
        return this;
    }

    setDefaultGraphHtmlAttr<K extends GraphDotAttr>(attr: K, value: NonNullable<GraphAttrs[K]>): this;
    setDefaultGraphHtmlAttr(attr: string, value: string | number | boolean): this;
    setDefaultGraphHtmlAttr(attr: string, value: unknown): this {
        this._graph.setDefaultGraphHtmlAttr(attr, String(value));
        return this;
    }

    /**
     * Set an attribute on a named node (e.g. `"color"`, `"label"`, `"shape"`).
     * The node must exist; call {@link addNode} first if needed.
     *
     * When `attr` is a known node attribute the value type is inferred
     * automatically.  A generic `string | number | boolean` fallback is
     * provided for custom attributes.  Omit `value` to reset the attribute to
     * Graphviz's default empty value.  `defaultValue` is passed to Graphviz as
     * the default for this attribute if it has not already been declared.
     */
    setNodeAttr<K extends NodeDotAttr>(node: string, attr: K, value?: NonNullable<NodeAttrs[K]>, defaultValue?: string | number | boolean): this;
    setNodeAttr(node: string, attr: string, value?: string | number | boolean, defaultValue?: string | number | boolean): this;
    setNodeAttr(node: string, attr: string, value: unknown = "", defaultValue?: unknown): this {
        if (defaultValue === undefined) {
            this._graph.setNodeAttr(node, attr, String(value));
        } else {
            this._graph.setNodeAttr(node, attr, String(value), String(defaultValue));
        }
        return this;
    }

    /** Alias for {@link setNodeAttr}. */
    setVertexAttr<K extends NodeDotAttr>(node: string, attr: K, value?: NonNullable<NodeAttrs[K]>, defaultValue?: string | number | boolean): this;
    setVertexAttr(node: string, attr: string, value?: string | number | boolean, defaultValue?: string | number | boolean): this;
    setVertexAttr(node: string, attr: string, value: unknown = "", defaultValue?: unknown): this {
        return this.setNodeAttr(node, attr, value as any, defaultValue as any);
    }

    setNodeHtmlAttr<K extends NodeDotAttr>(node: string, attr: K, value: NonNullable<NodeAttrs[K]>, defaultValue?: string | number | boolean): this;
    setNodeHtmlAttr(node: string, attr: string, value: string | number | boolean, defaultValue?: string | number | boolean): this;
    setNodeHtmlAttr(node: string, attr: string, value: unknown, defaultValue?: unknown): this {
        if (defaultValue === undefined) {
            this._graph.setNodeHtmlAttr(node, attr, String(value));
        } else {
            this._graph.setNodeHtmlAttr(node, attr, String(value), String(defaultValue));
        }
        return this;
    }

    /** Alias for {@link setNodeHtmlAttr}. */
    setVertexHtmlAttr<K extends NodeDotAttr>(node: string, attr: K, value: NonNullable<NodeAttrs[K]>, defaultValue?: string | number | boolean): this;
    setVertexHtmlAttr(node: string, attr: string, value: string | number | boolean, defaultValue?: string | number | boolean): this;
    setVertexHtmlAttr(node: string, attr: string, value: unknown, defaultValue?: unknown): this {
        return this.setNodeHtmlAttr(node, attr, value as any, defaultValue as any);
    }

    setDefaultNodeAttr<K extends NodeDotAttr>(attr: K, value: NonNullable<NodeAttrs[K]>): this;
    setDefaultNodeAttr(attr: string, value: string | number | boolean): this;
    setDefaultNodeAttr(attr: string, value: unknown): this {
        this._graph.setDefaultNodeAttr(attr, String(value));
        return this;
    }

    /** Alias for {@link setDefaultNodeAttr}. */
    setDefaultVertexAttr<K extends NodeDotAttr>(attr: K, value: NonNullable<NodeAttrs[K]>): this;
    setDefaultVertexAttr(attr: string, value: string | number | boolean): this;
    setDefaultVertexAttr(attr: string, value: unknown): this {
        return this.setDefaultNodeAttr(attr, value as any);
    }

    setDefaultNodeHtmlAttr<K extends NodeDotAttr>(attr: K, value: NonNullable<NodeAttrs[K]>): this;
    setDefaultNodeHtmlAttr(attr: string, value: string | number | boolean): this;
    setDefaultNodeHtmlAttr(attr: string, value: unknown): this {
        this._graph.setDefaultNodeHtmlAttr(attr, String(value));
        return this;
    }

    /** Alias for {@link setDefaultNodeHtmlAttr}. */
    setDefaultVertexHtmlAttr<K extends NodeDotAttr>(attr: K, value: NonNullable<NodeAttrs[K]>): this;
    setDefaultVertexHtmlAttr(attr: string, value: string | number | boolean): this;
    setDefaultVertexHtmlAttr(attr: string, value: unknown): this {
        return this.setDefaultNodeHtmlAttr(attr, value as any);
    }

    /**
     * Set an attribute on an edge identified by `(tail, head, key)`.
     * Use the same `key` that was passed to {@link addEdge}; pass `""` for
     * anonymous edges.
     *
     * When `attr` is a known edge attribute the value type is inferred
     * automatically.  A generic `string | number | boolean` fallback is
     * provided for custom attributes.  Omit `value` to reset the attribute to
     * Graphviz's default empty value.  `defaultValue` is passed to Graphviz as
     * the default for this attribute if it has not already been declared.
     */
    setEdgeAttr<K extends EdgeDotAttr>(tail: string, head: string, key: string, attr: K, value?: NonNullable<EdgeAttrs[K]>, defaultValue?: string | number | boolean): this;
    setEdgeAttr(tail: string, head: string, key: string, attr: string, value?: string | number | boolean, defaultValue?: string | number | boolean): this;
    setEdgeAttr(tail: string, head: string, key: string, attr: string, value: unknown = "", defaultValue?: unknown): this {
        if (defaultValue === undefined) {
            this._graph.setEdgeAttr(tail, head, key, attr, String(value));
        } else {
            this._graph.setEdgeAttr(tail, head, key, attr, String(value), String(defaultValue));
        }
        return this;
    }

    setEdgeHtmlAttr<K extends EdgeDotAttr>(tail: string, head: string, key: string, attr: K, value: NonNullable<EdgeAttrs[K]>, defaultValue?: string | number | boolean): this;
    setEdgeHtmlAttr(tail: string, head: string, key: string, attr: string, value: string | number | boolean, defaultValue?: string | number | boolean): this;
    setEdgeHtmlAttr(tail: string, head: string, key: string, attr: string, value: unknown, defaultValue?: unknown): this {
        if (defaultValue === undefined) {
            this._graph.setEdgeHtmlAttr(tail, head, key, attr, String(value));
        } else {
            this._graph.setEdgeHtmlAttr(tail, head, key, attr, String(value), String(defaultValue));
        }
        return this;
    }

    setDefaultEdgeAttr<K extends EdgeDotAttr>(attr: K, value: NonNullable<EdgeAttrs[K]>): this;
    setDefaultEdgeAttr(attr: string, value: string | number | boolean): this;
    setDefaultEdgeAttr(attr: string, value: unknown): this {
        this._graph.setDefaultEdgeAttr(attr, String(value));
        return this;
    }

    setDefaultEdgeHtmlAttr<K extends EdgeDotAttr>(attr: K, value: NonNullable<EdgeAttrs[K]>): this;
    setDefaultEdgeHtmlAttr(attr: string, value: string | number | boolean): this;
    setDefaultEdgeHtmlAttr(attr: string, value: unknown): this {
        this._graph.setDefaultEdgeHtmlAttr(attr, String(value));
        return this;
    }

    /**
     * Remove a node and all its edges from the graph.  Removing from the root
     * graph also removes the node from every subgraph.
     * No-op if the node does not exist.
     */
    removeNode(id: string): this {
        this._graph.removeNode(id);
        return this;
    }

    /** Alias for {@link removeNode}. */
    removeVertex(id: string): this {
        return this.removeNode(id);
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
     * Dissolve the cluster boundary for the subgraph with the given `id`.
     * Nodes and edges that belonged to the subgraph remain in the parent graph.
     * No-op if no subgraph with that id exists.
     */
    removeSubgraph(id: string): this {
        this._graph.removeSubgraph(subgraphCppName(id));
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

    /** Alias for {@link removeNodeAttr}. */
    removeVertexAttr(node: string, attr: string): this {
        return this.removeNodeAttr(node, attr);
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
     * Returns `true` if a node with the given id exists in the graph.
     */
    hasNode(id: string): boolean {
        return this._graph.hasNode(id);
    }

    /** Alias for {@link hasNode}. */
    hasVertex(id: string): boolean {
        return this.hasNode(id);
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
     * Returns `true` if a subgraph with the given id exists.
     */
    hasSubgraph(id: string): boolean {
        return this._graph.hasSubgraph(subgraphCppName(id));
    }

    // ---- Count queries --------------------------------------------------

    /** Returns the number of nodes in the graph. */
    nodeCount(): number { return this._graph.nodeCount(); }

    /** Alias for {@link nodeCount}. */
    vertexCount(): number { return this.nodeCount(); }

    /** Returns the number of edges in the graph. */
    edgeCount(): number { return this._graph.edgeCount(); }

    /** Returns the number of direct subgraphs of this graph. */
    subgraphCount(): number { return this._graph.subgraphCount(); }

    /** Returns the degree of the node with the given id in the graph. */
    nodeDegree(node: string, inDegree: number = 1, outDegree: number = 1): number {
        return this._graph.nodeDegree(node, inDegree, outDegree);
    }

    /** Alias for {@link nodeDegree}. */
    vertexDegree(node: string, inDegree: number = 1, outDegree: number = 1): number {
        return this.nodeDegree(node, inDegree, outDegree);
    }

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

    /** Alias for {@link getNodeAttr}. */
    getVertexAttr(node: string, attr: string): string {
        return this.getNodeAttr(node, attr);
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
     * Returns the ids of all direct subgraphs (the `cluster_` prefix is
     * stripped from the underlying cgraph names).
     */
    subgraphNames(): string[] {
        return parseNames(this._graph.subgraphNames()).map(subgraphIdFromCppName);
    }

    /**
     * Returns the ids of all nodes in the graph (in internal iteration order).
     */
    nodeNames(): string[] {
        return parseNames(this._graph.nodeNames());
    }

    /** Alias for {@link nodeNames}. */
    vertexNames(): string[] {
        return this.nodeNames();
    }

    /**
     * Returns all edges in the graph.  Each unique edge is listed exactly
     * once.
     */
    edges(): EdgeInfo[] {
        return parseEdges(this._graph.edges());
    }

    /**
     * Returns the out-edges of the node with the given id.  Returns `[]` if
     * the node does not exist.
     */
    outEdges(node: string): EdgeInfo[] {
        return parseEdges(this._graph.outEdges(node));
    }

    /** Alias for {@link outEdges}. */
    outEdgesFrom(node: string): EdgeInfo[] {
        return this.outEdges(node);
    }

    /**
     * Returns the in-edges of the node with the given id.  Returns `[]` if
     * the node does not exist.
     */
    inEdges(node: string): EdgeInfo[] {
        return parseEdges(this._graph.inEdges(node));
    }

    /** Alias for {@link inEdges}. */
    inEdgesTo(node: string): EdgeInfo[] {
        return this.inEdges(node);
    }

    /**
     * Returns all edges incident to the node with the given id (both in and
     * out).  Returns `[]` if the node does not exist.
     */
    nodeEdges(node: string): EdgeInfo[] {
        return parseEdges(this._graph.nodeEdges(node));
    }

    /** Alias for {@link nodeEdges}. */
    vertexEdges(node: string): EdgeInfo[] {
        return this.nodeEdges(node);
    }

    /**
     * Create (or return an existing) subgraph with the given `id`.  The
     * `cluster_` prefix is added to `id` internally so that layout engines
     * render it as a bounded cluster.  The subgraph's `id` Graphviz attribute
     * is set to the user-supplied `id` (without the prefix).
     *
     * Returns a {@link Subgraph} wrapper.  **Call {@link Subgraph.delete} (or
     * use the `using` keyword) when finished** to free the WASM wrapper.  The
     * subgraph data itself is owned by this graph.
     *
     * ```ts
     * using cluster = graph.addSubgraph("0");
     * cluster.setAttr("label", "My Cluster").addEdge("a", "b");
     * ```
     */
    addSubgraph(id: string, attrs?: AttrValues<ClusterAttrs>, htmlAttrs?: AttrValues<ClusterAttrs>): Subgraph;
    addSubgraph(init: SubgraphInit): Subgraph;
    addSubgraph(idOrInit: string | SubgraphInit, attrs?: AttrValues<ClusterAttrs>, htmlAttrs?: AttrValues<ClusterAttrs>): Subgraph {
        const init = typeof idOrInit === "string" ? { id: idOrInit, attrs, htmlAttrs } : idOrInit;
        // addSubgraph only returns null when the internal graph pointer is null,
        // which cannot happen while this Graph instance is alive.
        return new Subgraph(this._graph.addSubgraph(subgraphCppName(init.id))!).applyInit(init);
    }

    /**
     * Look up an existing subgraph by id without creating a new one.
     * Returns a {@link Subgraph} wrapper if found, or `null` if it does not
     * exist.  **Call {@link Subgraph.delete} (or use the `using` keyword)
     * when finished** to free the WASM wrapper.
     *
     * ```ts
     * using sg = graph.getSubgraph("0");
     * if (sg) {
     *     console.log(sg.nodeNames());
     * }
     * ```
     */
    getSubgraph(id: string): Subgraph | null {
        const sg = this._graph.getSubgraph(subgraphCppName(id));
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
    write(): string {
        return this._graph.write();
    }

    /**
     * Serialise the graph to a DOT-language string.
     */
    toDot(): string {
        return this.write();
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
     * attributes without writing DOT source by hand.  The graph's `id`
     * Graphviz attribute is automatically set to match `id`.  Call
     * {@link Graph.layout} to render directly, or {@link Graph.toDot} to
     * serialise to DOT.
     *
     * **You must call {@link Graph.delete} when finished** to free the
     * underlying WASM memory, or use the `using` keyword (TypeScript ≥ 5.2).
     *
     * @param id    The graph id (default `"G"`).
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
     * const svg = graph.layout(); // render without a DOT round-trip
     * ```
     */
    createGraph(id?: string, type?: GraphType): Graph;
    createGraph(init: GraphInit): Graph;
    createGraph(idOrInit: string | GraphInit = "G", type: GraphType = "directed"): Graph {
        const init = typeof idOrInit === "string"
            ? { id: idOrInit, type }
            : idOrInit;
        const resolvedId = init.id ?? "G";
        const resolvedType = init.type ?? "directed";
        const directed = !resolvedType.includes("undirected") ? 1 : 0;
        const strict = resolvedType.startsWith("strict") ? 1 : 0;
        return new Graph(new this._module.CGraph(resolvedId, directed, strict), this._module).applyInit(init);
    }

    /**
     * Parse DOT source into a mutable {@link Graph}.  The returned graph can
     * be queried, modified, rendered directly, or serialised back to DOT with
     * {@link Graph.toDot}.
     */
    read(dotSource: string): Graph {
        const graph = this.createGraph();
        try {
            graph.read(dotSource);
            return graph;
        } catch (e) {
            graph.delete();
            throw e;
        }
    }
}
