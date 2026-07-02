// --- Node shapes (https://graphviz.org/doc/info/shapes.html) ---

export type Shape =
    | "box" | "polygon" | "ellipse" | "oval" | "circle" | "point" | "egg" | "triangle"
    | "plaintext" | "plain" | "diamond" | "trapezium" | "parallelogram" | "house"
    | "pentagon" | "hexagon" | "septagon" | "octagon" | "doublecircle" | "doubleoctagon"
    | "tripleoctagon" | "invtriangle" | "invtrapezium" | "invhouse" | "Mdiamond"
    | "Msquare" | "Mcircle" | "rect" | "rectangle" | "square" | "star" | "none"
    | "underline" | "cylinder" | "note" | "tab" | "folder" | "box3d" | "component"
    | "promoter" | "cds" | "terminator" | "utr" | "primersite" | "restrictionsite"
    | "fivepoverhang" | "threepoverhang" | "noverhang" | "assembly" | "signature"
    | "insulator" | "ribosite" | "rnastab" | "proteasesite" | "proteinstab"
    | "rpromoter" | "rarrow" | "larrow" | "lpromoter" | "record" | "Mrecord";

// --- Arrow type (https://graphviz.org/docs/attr-types/arrowType/) ---

export type ArrowType =
    | "normal" | "inv" | "dot" | "invdot" | "odot" | "invodot" | "none" | "tee"
    | "empty" | "invempty" | "diamond" | "odiamond" | "ediamond" | "crow"
    | "box" | "obox" | "open" | "halfopen" | "vee";

// --- Edge direction type (https://graphviz.org/docs/attr-types/dirType/) ---

export type DirType = "forward" | "back" | "both" | "none";

// --- Style types (https://graphviz.org/docs/attr-types/style/) ---

export type EdgeStyle = "solid" | "dashed" | "dotted" | "bold" | "invis" | "tapered";

export type NodeStyle = "solid" | "dashed" | "dotted" | "bold" | "invis" | "filled" | "striped" | "wedged" | "diagonals" | "rounded" | "radial";

export type ClusterStyle = "solid" | "dashed" | "dotted" | "bold" | "invis" | "filled" | "striped" | "rounded" | "radial";

// --- Graph layout enums ---

/** Cluster ranking mode (https://graphviz.org/docs/attr-types/clusterMode/) */
export type ClusterMode = "local" | "global" | "none";

/** Output draw order (https://graphviz.org/docs/attr-types/outputMode/) */
export type OutputMode = "breadthfirst" | "nodesfirst" | "edgesfirst";

/** Graph layout direction (https://graphviz.org/docs/attr-types/rankdir/) */
export type RankDir = "TB" | "LR" | "BT" | "RL";

/** Subgraph rank constraint (https://graphviz.org/docs/attr-types/rankType/) */
export type RankType = "same" | "min" | "source" | "max" | "sink";

/** Page output order (https://graphviz.org/docs/attr-types/pagedir/) */
export type PageDir = "BL" | "BR" | "TL" | "TR" | "RB" | "RT" | "LB" | "LT";

/** Component packing granularity (https://graphviz.org/docs/attr-types/packMode/) */
export type PackMode = "node" | "cluster" | "graph";

/** Smoothing method for sfdp (https://graphviz.org/docs/attr-types/smoothType/) */
export type SmoothType = "none" | "avg_dist" | "graph_dist" | "power_dist" | "rng" | "spring" | "triangle";

/** Quadtree scheme for sfdp (https://graphviz.org/docs/attr-types/quadType/) */
export type QuadType = "normal" | "fast" | "none";

/** Compass point for port positions (https://graphviz.org/docs/attr-types/portPos/) */
export type CompassPoint = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw" | "c" | "_";

/** Vertical placement of labels for nodes, root graphs and clusters (https://graphviz.org/docs/attr-types/labelloc/) */
export type LabelLoc = "t" | "c" | "b";

// --- Node Attributes (https://graphviz.org/docs/nodes) ---

export interface NodeAttrs {
    area?: number;
    class?: string;
    color?: string;
    colorscheme?: string;
    comment?: string;
    distortion?: number;
    fillcolor?: string;
    fixedsize?: boolean | string;
    fontcolor?: string;
    fontname?: string;
    fontsize?: number;
    gradientangle?: number;
    group?: string;
    height?: number;
    href?: string;
    id?: string;
    image?: string;
    imagepos?: string;
    imagescale?: boolean | string;
    label?: string;
    labelloc?: LabelLoc;
    layer?: string;
    margin?: number | string;
    nojustify?: boolean;
    ordering?: string;
    orientation?: number;
    penwidth?: number;
    peripheries?: number;
    pin?: boolean;
    pos?: string;
    rects?: string;
    regular?: boolean;
    root?: string | boolean;
    samplepoints?: number;
    shape?: Shape;
    shapefile?: string;
    showboxes?: number;
    sides?: number;
    skew?: number;
    sortv?: number;
    style?: string;
    target?: string;
    tooltip?: string;
    URL?: string;
    vertices?: string;
    width?: number;
    xlabel?: string;
    xlp?: string;
    z?: number;
}

// --- Edge Attributes (https://graphviz.org/docs/edges) ---

export interface EdgeAttrs {
    arrowhead?: ArrowType;
    arrowsize?: number;
    arrowtail?: ArrowType;
    class?: string;
    color?: string;
    colorscheme?: string;
    comment?: string;
    constraint?: boolean;
    decorate?: boolean;
    dir?: DirType;
    edgehref?: string;
    edgetarget?: string;
    edgetooltip?: string;
    edgeURL?: string;
    fillcolor?: string;
    fontcolor?: string;
    fontname?: string;
    fontsize?: number;
    head_lp?: string;
    headclip?: boolean;
    headhref?: string;
    headlabel?: string;
    headport?: string;
    headtarget?: string;
    headtooltip?: string;
    headURL?: string;
    href?: string;
    id?: string;
    label?: string;
    labelangle?: number;
    labeldistance?: number;
    labelfloat?: boolean;
    labelfontcolor?: string;
    labelfontname?: string;
    labelfontsize?: number;
    labelhref?: string;
    labeltarget?: string;
    labeltooltip?: string;
    labelURL?: string;
    layer?: string;
    len?: number;
    lhead?: string;
    lp?: string;
    ltail?: string;
    minlen?: number;
    nojustify?: boolean;
    penwidth?: number;
    pos?: string;
    radius?: number;
    samehead?: string;
    sametail?: string;
    showboxes?: number;
    style?: EdgeStyle | string;
    tail_lp?: string;
    tailclip?: boolean;
    tailhref?: string;
    taillabel?: string;
    tailport?: string;
    tailtarget?: string;
    tailtooltip?: string;
    tailURL?: string;
    target?: string;
    tooltip?: string;
    URL?: string;
    weight?: number;
    xlabel?: string;
    xlp?: string;

}

// --- Cluster Attributes (https://graphviz.org/docs/clusters) ---

export interface ClusterAttrs {
    area?: number;
    bb?: string;
    bgcolor?: string;
    class?: string;
    cluster?: boolean;
    color?: string;
    colorscheme?: string;
    fillcolor?: string;
    fontcolor?: string;
    fontname?: string;
    fontsize?: number;
    gradientangle?: number;
    href?: string;
    id?: string;
    K?: number;
    label?: string;
    labeljust?: string;
    labelloc?: LabelLoc;
    layer?: string;
    lheight?: number;
    lp?: string;
    lwidth?: number;
    margin?: number | string;
    nojustify?: boolean;
    pencolor?: string;
    penwidth?: number;
    peripheries?: number;
    rank?: RankType;
    sortv?: number;
    style?: string;
    target?: string;
    tooltip?: string;
    URL?: string;

}

// --- Graph Attributes (https://graphviz.org/docs/graph) ---

export interface GraphAttrs {
    _background?: string;
    bb?: string;
    beautify?: boolean;
    bgcolor?: string;
    center?: boolean;
    charset?: string;
    class?: string;
    clusterrank?: ClusterMode;
    colorscheme?: string;
    comment?: string;
    compound?: boolean;
    concentrate?: boolean;
    Damping?: number;
    defaultdist?: number;
    dim?: number;
    dimen?: number;
    diredgeconstraints?: string | boolean;
    dpi?: number;
    epsilon?: number;
    esep?: string;
    fontcolor?: string;
    fontname?: string;
    fontnames?: string;
    fontpath?: string;
    fontsize?: number;
    forcelabels?: boolean;
    gradientangle?: number;
    href?: string;
    id?: string;
    imagepath?: string;
    inputscale?: number;
    K?: number;
    label?: string;
    label_scheme?: number;
    labeljust?: string;
    labelloc?: LabelLoc;
    landscape?: boolean;
    layerlistsep?: string;
    layers?: string;
    layerselect?: string;
    layersep?: string;
    layout?: string;
    levels?: number;
    levelsgap?: number;
    lheight?: number;
    linelength?: number;
    lp?: string;
    lwidth?: number;
    margin?: number | string;
    maxiter?: number;
    mclimit?: number;
    mindist?: number;
    mode?: string;
    model?: string;
    newrank?: boolean;
    nodesep?: number;
    nojustify?: boolean;
    normalize?: number | boolean;
    notranslate?: boolean;
    nslimit?: number;
    nslimit1?: number;
    oneblock?: boolean;
    ordering?: string;
    orientation?: string;
    outputorder?: OutputMode;
    overlap?: string | boolean;
    overlap_scaling?: number;
    overlap_shrink?: boolean;
    pack?: boolean | number;
    packmode?: string;
    pad?: number | string;
    page?: number | string;
    pagedir?: PageDir;
    quantum?: number;
    rankdir?: RankDir;
    ranksep?: number | string;
    ratio?: number | string;
    remincross?: boolean;
    repulsiveforce?: number;
    resolution?: number;
    root?: string | boolean;
    rotate?: number;
    rotation?: number;
    scale?: number | string;
    searchsize?: number;
    sep?: string;
    showboxes?: number;
    size?: number | string;
    smoothing?: SmoothType;
    sortv?: number;
    splines?: boolean | string;
    start?: string;
    style?: string;
    stylesheet?: string;
    target?: string;
    TBbalance?: string;
    tooltip?: string;
    truecolor?: boolean;
    URL?: string;
    viewport?: string;
    voro_margin?: number;
    xdotversion?: string;
}

// --- DOT attribute name arrays for generic collection ---
// Uses Record<Key, true> pattern to guarantee completeness at compile time:
// adding a property to an interface without updating the corresponding record
// produces a TypeScript error for the missing key.

/** Extracts keys from a validated Record<K, true> as an immutable typed array. */
function attrsOf<K extends string>(record: Record<K, true>): readonly K[] {
    return Object.freeze(Object.keys(record) as K[]);
}

// Write-only attributes are set by layout engines, not user input
type NodeWriteOnly = "rects" | "vertices" | "xlp";
type EdgeWriteOnly = "head_lp" | "tail_lp" | "lp" | "xlp";
type ClusterWriteOnly = "bb" | "lheight" | "lp" | "lwidth";
type GraphExcluded = "type" | "strict" | "nodeDefaults" | "edgeDefaults" | "graphDefaults" | "bb" | "lheight" | "lp" | "lwidth";

// DOT attribute key types — derived from interfaces minus excluded keys.
// If a new property is added to an interface, the corresponding record below
// will fail to compile until the key is added (or explicitly excluded).
export type NodeDotAttr = Exclude<keyof NodeAttrs, NodeWriteOnly>;
export type EdgeDotAttr = Exclude<keyof EdgeAttrs, EdgeWriteOnly>;
export type ClusterDotAttr = Exclude<keyof ClusterAttrs, ClusterWriteOnly>;
export type GraphDotAttr = Exclude<keyof GraphAttrs, GraphExcluded>;

/** Node DOT attributes (excludes inherited base keys and write-only: rects, vertices, xlp) */
export const NODE_DOT_ATTRS: readonly NodeDotAttr[] = attrsOf<NodeDotAttr>({
    area: true,
    class: true,
    color: true,
    colorscheme: true,
    comment: true,
    distortion: true,
    fillcolor: true,
    fixedsize: true,
    fontcolor: true,
    fontname: true,
    fontsize: true,
    gradientangle: true,
    group: true,
    height: true,
    href: true,
    id: true,
    image: true,
    imagepos: true,
    imagescale: true,
    label: true,
    labelloc: true,
    layer: true,
    margin: true,
    nojustify: true,
    ordering: true,
    orientation: true,
    penwidth: true,
    peripheries: true,
    pin: true,
    pos: true,
    regular: true,
    root: true,
    samplepoints: true,
    shape: true,
    shapefile: true,
    showboxes: true,
    sides: true,
    skew: true,
    sortv: true,
    style: true,
    target: true,
    tooltip: true,
    URL: true,
    width: true,
    xlabel: true,
    z: true,
});

/** Edge DOT attributes (excludes inherited base keys and write-only: head_lp, tail_lp, lp, xlp) */
export const EDGE_DOT_ATTRS: readonly EdgeDotAttr[] = attrsOf<EdgeDotAttr>({
    arrowhead: true,
    arrowsize: true,
    arrowtail: true,
    class: true,
    color: true,
    colorscheme: true,
    comment: true,
    constraint: true,
    decorate: true,
    dir: true,
    edgehref: true,
    edgetarget: true,
    edgetooltip: true,
    edgeURL: true,
    fillcolor: true,
    fontcolor: true,
    fontname: true,
    fontsize: true,
    headclip: true,
    headhref: true,
    headlabel: true,
    headport: true,
    headtarget: true,
    headtooltip: true,
    headURL: true,
    href: true,
    id: true,
    label: true,
    labelangle: true,
    labeldistance: true,
    labelfloat: true,
    labelfontcolor: true,
    labelfontname: true,
    labelfontsize: true,
    labelhref: true,
    labeltarget: true,
    labeltooltip: true,
    labelURL: true,
    layer: true,
    len: true,
    lhead: true,
    ltail: true,
    minlen: true,
    nojustify: true,
    penwidth: true,
    pos: true,
    radius: true,
    samehead: true,
    sametail: true,
    showboxes: true,
    style: true,
    tailclip: true,
    tailhref: true,
    taillabel: true,
    tailport: true,
    tailtarget: true,
    tailtooltip: true,
    tailURL: true,
    target: true,
    tooltip: true,
    URL: true,
    weight: true,
    xlabel: true,
});

/** Cluster DOT attributes (excludes inherited base keys and write-only: bb, lheight, lp, lwidth) */
export const CLUSTER_DOT_ATTRS: readonly ClusterDotAttr[] = attrsOf<ClusterDotAttr>({
    area: true,
    bgcolor: true,
    class: true,
    cluster: true,
    color: true,
    colorscheme: true,
    fillcolor: true,
    fontcolor: true,
    fontname: true,
    fontsize: true,
    gradientangle: true,
    href: true,
    id: true,
    K: true,
    label: true,
    labeljust: true,
    labelloc: true,
    layer: true,
    margin: true,
    nojustify: true,
    pencolor: true,
    penwidth: true,
    peripheries: true,
    rank: true,
    sortv: true,
    style: true,
    target: true,
    tooltip: true,
    URL: true,
});

/** Graph DOT attributes (excludes write-only: bb, lheight, lp, lwidth; and non-DOT: type) */
export const GRAPH_DOT_ATTRS: readonly GraphDotAttr[] = attrsOf<GraphDotAttr>({
    _background: true,
    beautify: true,
    bgcolor: true,
    center: true,
    charset: true,
    class: true,
    clusterrank: true,
    colorscheme: true,
    comment: true,
    compound: true,
    concentrate: true,
    Damping: true,
    defaultdist: true,
    dim: true,
    dimen: true,
    diredgeconstraints: true,
    dpi: true,
    epsilon: true,
    esep: true,
    fontcolor: true,
    fontname: true,
    fontnames: true,
    fontpath: true,
    fontsize: true,
    forcelabels: true,
    gradientangle: true,
    href: true,
    id: true,
    imagepath: true,
    inputscale: true,
    K: true,
    label: true,
    label_scheme: true,
    labeljust: true,
    labelloc: true,
    landscape: true,
    layerlistsep: true,
    layers: true,
    layerselect: true,
    layersep: true,
    layout: true,
    levels: true,
    levelsgap: true,
    linelength: true,
    margin: true,
    maxiter: true,
    mclimit: true,
    mindist: true,
    mode: true,
    model: true,
    newrank: true,
    nodesep: true,
    nojustify: true,
    normalize: true,
    notranslate: true,
    nslimit: true,
    nslimit1: true,
    oneblock: true,
    ordering: true,
    orientation: true,
    outputorder: true,
    overlap: true,
    overlap_scaling: true,
    overlap_shrink: true,
    pack: true,
    packmode: true,
    pad: true,
    page: true,
    pagedir: true,
    quantum: true,
    rankdir: true,
    ranksep: true,
    ratio: true,
    remincross: true,
    repulsiveforce: true,
    resolution: true,
    root: true,
    rotate: true,
    rotation: true,
    scale: true,
    searchsize: true,
    sep: true,
    showboxes: true,
    size: true,
    smoothing: true,
    sortv: true,
    splines: true,
    start: true,
    style: true,
    stylesheet: true,
    target: true,
    TBbalance: true,
    tooltip: true,
    truecolor: true,
    URL: true,
    viewport: true,
    voro_margin: true,
    xdotversion: true,
});
