import { describe, it, expect } from "vitest";
import { EdgeInfo, Graph, GraphType, Graphviz, Subgraph } from "@hpcc-js/wasm-graphviz";
import type { MainModule } from "../types/graphvizlib.js";

describe("Graph (programmatic graph creation)", function () {

    it("createGraph returns a Graph instance", async function () {
        const graphviz = await Graphviz.load();
        const graph = graphviz.createGraph("G");
        expect(graph).toBeInstanceOf(Graph);
        graph.delete();
    });

    it("toDot produces valid DOT for a simple directed graph", async function () {
        const graphviz = await Graphviz.load();
        const graph = graphviz.createGraph("G");
        graph.addNode("a");
        graph.addNode("b");
        graph.addEdge("a", "b");
        const dot = graph.toDot();
        graph.delete();

        expect(dot).toContain("digraph");
        expect(dot).toContain("a");
        expect(dot).toContain("b");
    });

    it("toDot produces valid DOT for an undirected graph", async function () {
        const graphviz = await Graphviz.load();
        const graph = graphviz.createGraph("UG", "undirected");
        graph.addEdge("x", "y");
        const dot = graph.toDot();
        graph.delete();

        // undirected graphs use "graph" keyword, not "digraph"
        expect(dot).toMatch(/^graph\s/m);
    });

    it("read parses DOT and toDot writes it back", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.read(`digraph G { a -> b [label="hello"]; }`);

        expect(graph.hasNode("a")).toBe(true);
        expect(graph.hasNode("b")).toBe(true);
        expect(graph.hasEdge("a", "b")).toBe(true);
        expect(graph.getEdgeAttr("a", "b", "", "label")).toBe("hello");
        expect(graph.write()).toContain("hello");
        expect(graph.toDot()).toContain("hello");
    });

    it("read throws for invalid DOT", async function () {
        const graphviz = await Graphviz.load();
        expect(() => graphviz.read(`digraph G { a -> }`)).toThrow("Invalid DOT source");
    });

    it("setGraphAttr appears in DOT output", async function () {
        const graphviz = await Graphviz.load();
        const graph = graphviz.createGraph("G");
        graph.setGraphAttr("rankdir", "LR");
        const dot = graph.toDot();
        graph.delete();

        expect(dot).toContain("rankdir");
        expect(dot).toContain("LR");
    });

    it("defaults graph fontname to Arial when omitted", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");

        expect(graph.getGraphAttr("fontname")).toBe("Arial");
        expect(graph.toDot()).toContain("fontname=Arial");
    });

    it("defaults node and edge fontname to Arial via global defaults", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addNode("n1").addEdge("a", "b");

        expect(graph.getNodeAttr("n1", "fontname")).toBe("Arial");
        expect(graph.getEdgeAttr("a", "b", "", "fontname")).toBe("Arial");
        const dot = graph.toDot();
        expect(dot).toContain("node [fontname=Arial]");
        expect(dot).toContain("edge [fontname=Arial]");
    });

    it("keeps explicit graph fontname when provided", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph({
            name: "G",
            attrs: { fontname: "Helvetica" }
        });

        expect(graph.getGraphAttr("fontname")).toBe("Helvetica");
        expect(graph.toDot()).toContain("fontname=Helvetica");
    });

    it("allows overriding default node and edge fontname", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph
            .setDefaultNodeAttr("fontname", "Helvetica")
            .setDefaultEdgeAttr("fontname", "Helvetica")
            .addNode("n1")
            .addEdge("a", "b");

        expect(graph.getNodeAttr("n1", "fontname")).toBe("Helvetica");
        expect(graph.getEdgeAttr("a", "b", "", "fontname")).toBe("Helvetica");
    });

    it("setNodeAttr appears in DOT output", async function () {
        const graphviz = await Graphviz.load();
        const graph = graphviz.createGraph("G");
        graph.addNode("n1");
        graph.setNodeAttr("n1", "color", "red");
        const dot = graph.toDot();
        graph.delete();

        expect(dot).toContain("color");
        expect(dot).toContain("red");
    });

    it("setting one node label preserves implicit labels on other nodes", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addNode("A").addNode("B").addNode("C").addEdge("A", "B").addEdge("A", "C");

        graph.setNodeAttr("A", "label", "G-Node");

        const svg = graph.layout("svg", "dot");
        expect(svg).toContain("G&#45;Node");
        expect(svg).toContain(">B<");
        expect(svg).toContain(">C<");
    });

    it("setEdgeAttr appears in DOT output", async function () {
        const graphviz = await Graphviz.load();
        const graph = graphviz.createGraph("G");
        graph
            .addEdge("a", "b")
            .setEdgeAttr("a", "b", "", "label", "hello")
            ;
        const dot = graph.toDot();
        graph.delete();


        expect(dot).toContain("label");
        expect(dot).toContain("hello");
    });

    it("createGraph, addNode, and addEdge accept init objects with attrs", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph({
            name: "G",
            type: "directed",
            attrs: { rankdir: "LR" }
        });

        graph
            .addNode({
                name: "a",
                attrs: { color: "red", shape: "box" },
                htmlAttrs: { label: "<B>A</B>" }
            })
            .addEdge({
                tail: "a",
                head: "b",
                attrs: { label: "hello", color: "blue" },
                htmlAttrs: { headlabel: "<I>B</I>" }
            });

        const dot = graph.toDot();

        expect(dot).toContain("rankdir=LR");
        expect(dot).toContain("color=red");
        expect(dot).toContain("shape=box");
        expect(dot).toContain("label=<<B>A</B>>");
        expect(dot).toContain("hello");
        expect(dot).toContain("color=blue");
        expect(dot).toContain("headlabel=<<I>B</I>>");
    });

    it("attribute setters reset to default when value is omitted", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph
            .addNode("n1")
            .addEdge("a", "b")
            .setGraphAttr("rankdir", "LR")
            .setNodeAttr("n1", "color", "red")
            .setEdgeAttr("a", "b", "", "label", "hello")
            .setGraphAttr("rankdir")
            .setNodeAttr("n1", "color")
            .setEdgeAttr("a", "b", "", "label");

        expect(graph.getGraphAttr("rankdir")).toBe("");
        expect(graph.getNodeAttr("n1", "color")).toBe("");
        expect(graph.getEdgeAttr("a", "b", "", "label")).toBe("");
    });

    it("setNodeAttr and setEdgeAttr accept a Graphviz default value", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph
            .addNode("n1")
            .addNode("n2")
            .addEdge("a", "b")
            .addEdge("c", "d")
            .setNodeAttr("n1", "color", "red", "blue")
            .setEdgeAttr("a", "b", "", "label", "hello", "default-label");

        expect(graph.getNodeAttr("n1", "color")).toBe("red");
        expect(graph.getNodeAttr("n2", "color")).toBe("blue");
        expect(graph.getEdgeAttr("a", "b", "", "label")).toBe("hello");
        expect(graph.getEdgeAttr("c", "d", "", "label")).toBe("default-label");
    });

    it("default attribute setters apply to existing and new objects", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph
            .addNode("n1")
            .addEdge("a", "b")
            .setDefaultGraphAttr("label", "Graph Label")
            .setDefaultNodeAttr("shape", "box")
            .setDefaultEdgeAttr("color", "red")
            .addNode("n2")
            .addEdge("c", "d");

        expect(graph.getGraphAttr("label")).toBe("Graph Label");
        expect(graph.getNodeAttr("n1", "shape")).toBe("box");
        expect(graph.getNodeAttr("n2", "shape")).toBe("box");
        expect(graph.getEdgeAttr("a", "b", "", "color")).toBe("red");
        expect(graph.getEdgeAttr("c", "d", "", "color")).toBe("red");
    });

    it("HTML-like attributes serialize without quoted DOT strings", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph
            .addNode("n1")
            .addEdge("a", "b")
            .setGraphHtmlAttr("label", "<B>Graph</B>")
            .setNodeHtmlAttr("n1", "label", "<I>Node</I>")
            .setEdgeHtmlAttr("a", "b", "", "label", "<U>Edge</U>");

        const dot = graph.toDot();
        expect(dot).toContain("label=<<B>Graph</B>>");
        expect(dot).toContain("label=<<I>Node</I>>");
        expect(dot).toContain("label=<<U>Edge</U>>");
    });

    it("fluent API (method chaining) works", async function () {
        const graphviz = await Graphviz.load();
        const graph = graphviz.createGraph("G");
        graph
            .addNode("a")
            .addNode("b")
            .addEdge("a", "b")
            .setNodeAttr("a", "shape", "box")
            .setGraphAttr("rankdir", "LR");
        const dot = graph.toDot();
        graph.delete();

        expect(dot).toContain("shape");
        expect(dot).toContain("box");
    });

    it("createGraph output can be laid out by graphviz.layout", async function () {
        const graphviz = await Graphviz.load();
        const graph = graphviz.createGraph("G");
        graph.addEdge("Hello", "World");
        const dot = graph.toDot();
        graph.delete();

        const svg = graphviz.layout(dot, "svg", "dot");
        expect(svg).toContain("<svg");
        expect(svg).toContain("Hello");
        expect(svg).toContain("World");
    });

    it("strict directed graph disallows parallel edges in DOT", async function () {
        const graphviz = await Graphviz.load();
        const graph = graphviz.createGraph("G", "strict directed");
        graph.addEdge("a", "b");
        graph.addEdge("a", "b"); // duplicate – should be silently ignored
        const dot = graph.toDot();
        graph.delete();

        expect(dot).toMatch(/^strict digraph/m);
    });

    it("all GraphType values produce non-empty DOT", async function () {
        const graphviz = await Graphviz.load();
        const types: GraphType[] = ["directed", "undirected", "strict directed", "strict undirected"];
        for (const type of types) {
            const graph = graphviz.createGraph("G", type);
            graph.addEdge("a", "b");
            const dot = graph.toDot();
            graph.delete();
            expect(dot).not.toBe("");
        }
    });

    it("Symbol.dispose is supported (using keyword)", async function () {
        const graphviz = await Graphviz.load();
        let dot: string;
        {
            using graph = graphviz.createGraph("G");
            graph.addEdge("p", "q");
            dot = graph.toDot();
        }
        expect(dot).toContain("digraph");
    });
});

describe("Graph.layout (direct render without DOT round-trip)", function () {

    it("returns an SVG string", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("Hello", "World");
        const svg = graph.layout();
        expect(svg).toContain("<svg");
        expect(svg).toContain("Hello");
        expect(svg).toContain("World");
    });

    it("defaults to svg / dot engine", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("a", "b");
        const svg = graph.layout();
        expect(svg).toContain("<svg");
    });

    it("respects outputFormat argument", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("a", "b");
        const plain = graph.layout("plain");
        // plain format starts with "graph" followed by scale factor
        expect(plain).toMatch(/^graph\s/);
    });

    it("respects layoutEngine argument", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("a", "b").addEdge("b", "c");
        const svg = graph.layout("svg", "circo");
        expect(svg).toContain("<svg");
    });

    it("result matches graphviz.layout(graph.toDot())", async function () {
        const graphviz = await Graphviz.load();

        using graph = graphviz.createGraph("G");
        graph
            .addNode("A")
            .addNode("B")
            .addEdge("A", "B")
            .setNodeAttr("A", "color", "red")
            .setNodeAttr("A", "color", "navy")
            .setGraphAttr("rankdir", "LR");

        const dot = graph.toDot();
        const direct = graph.layout("svg", "dot");
        console.log(dot);

        // Re-create identical graph and go via toDot path
        using graph2 = graphviz.createGraph("G");
        graph2
            .addNode("A")
            .addNode("B")
            .addEdge("A", "B")
            .setNodeAttr("A", "color", "navy")
            .setGraphAttr("rankdir", "LR");
        const viaDot = graphviz.layout(graph2.toDot(), "svg", "dot");

        expect(direct).toBe(viaDot);
    });

    it("graph can be re-laid out after layout() call", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("a", "b");
        const svg1 = graph.layout("svg", "dot");
        const svg2 = graph.layout("svg", "circo");
        expect(svg1).toContain("<svg");
        expect(svg2).toContain("<svg");
        // Different engines produce different output
        expect(svg1).not.toBe(svg2);
    });

    it("toDot() still works after layout() call", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("x", "y");
        graph.layout();
        const dot = graph.toDot();
        expect(dot).toContain("digraph");
    });

    it("works with cluster subgraphs", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        {
            using c = graph.addSubgraph("cluster_0");
            c.setAttr("label", "Cluster").addEdge("a", "b");
        }
        const svg = graph.layout("svg", "dot");
        expect(svg).toContain("<svg");
        expect(svg).toContain("Cluster");
    });
});

describe("Subgraph / cluster (programmatic graph creation)", function () {

    it("addSubgraph returns a Subgraph instance", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        const sg = graph.addSubgraph("sub");
        expect(sg).toBeInstanceOf(Subgraph);
        sg.delete();
    });

    it("subgraph name appears in parent DOT output", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        {
            using sg = graph.addSubgraph("sub");
            sg.addNode("x");
        }
        expect(graph.toDot()).toContain("sub");
    });

    it("nodes added to subgraph appear in parent DOT output", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        {
            using sg = graph.addSubgraph("sub");
            sg.addNode("alpha");
            sg.addNode("beta");
        }
        const dot = graph.toDot();
        expect(dot).toContain("alpha");
        expect(dot).toContain("beta");
    });

    it("edges added to subgraph appear in parent DOT output", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        {
            using sg = graph.addSubgraph("sub");
            sg.addEdge("a", "b");
        }
        const dot = graph.toDot();
        expect(dot).toContain("a");
        expect(dot).toContain("b");
    });

    it("setAttr sets subgraph-level attributes", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        {
            using sg = graph.addSubgraph("sub");
            sg.setAttr("label", "My Label");
            sg.setAttr("style", "dashed");
        }
        const dot = graph.toDot();
        expect(dot).toContain("My Label");
        expect(dot).toContain("dashed");
    });

    it("cluster fontname defaults to Arial via graph default", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        {
            using sg = graph.addSubgraph("cluster_font");
            sg.setAttr("label", "ClusterFontCheck").addNode("n1");
        }

        const dot = graph.toDot();
        expect(dot).toContain("graph [fontname=Arial]");
    });

    it("addSubgraph accepts an init object with attrs", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        {
            using sg = graph.addSubgraph({
                name: "cluster_json",
                attrs: { label: "JSON Cluster", color: "lightblue", style: "filled" },
                htmlAttrs: { tooltip: "<B>cluster tooltip</B>" }
            });
            sg.addNode({ name: "x", attrs: { shape: "ellipse" } });
        }

        const dot = graph.toDot();
        expect(dot).toContain("cluster_json");
        expect(dot).toContain("JSON Cluster");
        expect(dot).toContain("lightblue");
        expect(dot).toContain("filled");
        expect(dot).toContain("tooltip=<<B>cluster tooltip</B>>");
    });

    it("cluster subgraph with attributes can be laid out", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");

        {
            using c0 = graph.addSubgraph("cluster_0");
            c0.setAttr("label", "Process #1")
                .setAttr("style", "filled")
                .setAttr("color", "lightgrey")
                .addEdge("a0", "a1")
                .addEdge("a1", "a2");
        }

        {
            using c1 = graph.addSubgraph("cluster_1");
            c1.setAttr("label", "Process #2")
                .setAttr("color", "blue")
                .addEdge("b0", "b1")
                .addEdge("b1", "b2");
        }

        graph.addEdge("start", "a0").addEdge("start", "b0");

        const dot = graph.toDot();
        expect(dot).toContain("cluster_0");
        expect(dot).toContain("cluster_1");

        const svg = graphviz.layout(dot, "svg", "dot");
        expect(svg).toContain("<svg");
        expect(svg).toContain("Process #1");
        expect(svg).toContain("Process #2");
    });

    it("supports nested subgraphs via Subgraph.addSubgraph", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");

        {
            using outer = graph.addSubgraph("cluster_outer");
            outer.setAttr("label", "Outer");
            {
                using inner = outer.addSubgraph({
                    name: "cluster_inner",
                    attrs: { label: "Inner", color: "red" }
                });
                inner.addEdge("x", "y");
            }
        }

        const dot = graph.toDot();
        expect(dot).toContain("cluster_outer");
        expect(dot).toContain("cluster_inner");
        expect(dot).toContain("Outer");
        expect(dot).toContain("Inner");
    });

    it("nested subgraphs inherit parent cluster attrs except label", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");

        using outer = graph.addSubgraph("cluster_outer");
        outer
            .setAttr("label", "Outer")
            .setAttr("color", "red")
            .setAttr("style", "filled");

        using inner = outer.addSubgraph("cluster_inner");

        // Subgraph label starts empty (not inherited)
        expect(inner.getAttr("label")).toBe("");
        // But other cluster attrs are inherited from parent
        expect(inner.getAttr("color")).toBe("red");
        expect(inner.getAttr("style")).toBe("filled");
    });

    it("nested subgraphs inherit parent node and edge defaults", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");

        using outer = graph.addSubgraph("cluster_outer");
        outer
            .setDefaultNodeAttr("shape", "box")
            .setDefaultEdgeAttr("color", "blue");

        using inner = outer.addSubgraph("cluster_inner");
        inner.addNode("n1").addNode("n2").addEdge("n1", "n2");

        // Nested subgraph inherits parent node and edge defaults
        expect(inner.getNodeAttr("n1", "shape")).toBe("box");
        expect(inner.getEdgeAttr("n1", "n2", "", "color")).toBe("blue");
    });

    it("setNodeAttr inside subgraph appears in DOT output", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        {
            using sg = graph.addSubgraph("cluster_x");
            sg.addNode("n1");
            sg.setNodeAttr("n1", "shape", "box");
        }
        expect(graph.toDot()).toContain("box");
    });

    it("setting one subgraph node label preserves implicit labels on sibling nodes", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        using sg = graph.addSubgraph("cluster_x");

        sg.addNode("A").addNode("B").addNode("C").addEdge("A", "B").addEdge("A", "C");
        sg.setNodeAttr("A", "label", "G-Node");

        const svg = graph.layout("svg", "dot");
        expect(svg).toContain("G&#45;Node");
        expect(svg).toContain(">B<");
        expect(svg).toContain(">C<");
    });

    it("setEdgeAttr inside subgraph appears in DOT output", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        {
            using sg = graph.addSubgraph("cluster_x");
            sg.addEdge("p", "q");
            sg.setEdgeAttr("p", "q", "", "label", "edge-label");
        }
        expect(graph.toDot()).toContain("edge-label");
    });

    it("subgraph attribute setters reset to default when value is omitted", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        {
            using sg = graph.addSubgraph("cluster_x");
            sg
                .addNode("n1")
                .addEdge("p", "q")
                .setAttr("label", "Cluster")
                .setNodeAttr("n1", "shape", "box")
                .setEdgeAttr("p", "q", "", "label", "edge-label")
                .setAttr("label")
                .setNodeAttr("n1", "shape")
                .setEdgeAttr("p", "q", "", "label");

            expect(sg.getAttr("label")).toBe("");
            expect(sg.getNodeAttr("n1", "shape")).toBe("");
            expect(sg.getEdgeAttr("p", "q", "", "label")).toBe("");
        }
    });

    it("subgraph node and edge setters accept a Graphviz default value", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        {
            using sg = graph.addSubgraph("cluster_x");
            sg
                .addNode("n1")
                .addNode("n2")
                .addEdge("a", "b")
                .addEdge("c", "d")
                .setNodeAttr("n1", "shape", "box", "ellipse")
                .setEdgeAttr("a", "b", "", "label", "hello", "default-label");

            expect(sg.getNodeAttr("n1", "shape")).toBe("box");
            expect(sg.getNodeAttr("n2", "shape")).toBe("ellipse");
            expect(sg.getEdgeAttr("a", "b", "", "label")).toBe("hello");
            expect(sg.getEdgeAttr("c", "d", "", "label")).toBe("default-label");
        }
    });

    it("subgraph default and HTML-like attribute setters work", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        {
            using sg = graph.addSubgraph("cluster_x");
            sg
                .addNode("n1")
                .addEdge("a", "b")
                .setDefaultAttr("label", "Cluster Label")
                .setDefaultNodeAttr("shape", "box")
                .setDefaultEdgeAttr("color", "blue")
                .setHtmlAttr("label", "<B>Cluster</B>")
                .setNodeHtmlAttr("n1", "label", "<I>Node</I>")
                .setEdgeHtmlAttr("a", "b", "", "label", "<U>Edge</U>");

            expect(sg.getAttr("label")).toBe("<B>Cluster</B>");
            expect(sg.getNodeAttr("n1", "shape")).toBe("box");
            expect(sg.getEdgeAttr("a", "b", "", "color")).toBe("blue");
        }

        const dot = graph.toDot();
        expect(dot).toContain("label=<<B>Cluster</B>>");
        expect(dot).toContain("label=<<I>Node</I>>");
        expect(dot).toContain("label=<<U>Edge</U>>");
    });

    it("Symbol.dispose frees the subgraph wrapper without losing graph data", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        {
            using sg = graph.addSubgraph("cluster_0");
            sg.setAttr("label", "Disposed");
            sg.addEdge("x", "y");
        }
        // After sg is disposed the data is still in the parent graph
        const dot = graph.toDot();
        console.log(dot);
        expect(dot).toContain("cluster_0");
        expect(dot).toContain("Disposed");
    });

    it("multiple subgraphs are independent", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");

        {
            using sg1 = graph.addSubgraph("cluster_a");
            sg1.setAttr("label", "Alpha");
            sg1.addEdge("a1", "a2");
        }
        {
            using sg2 = graph.addSubgraph("cluster_b");
            sg2.setAttr("label", "Beta");
            sg2.addEdge("b1", "b2");
        }

        const dot = graph.toDot();
        console.log(dot);
        expect(dot).toContain("Alpha");
        expect(dot).toContain("Beta");
        expect(dot).toContain("cluster_a");
        expect(dot).toContain("cluster_b");

        const svg = graph.layout("svg", "dot");
        console.log(svg);
        expect(svg).toContain("<svg");
        expect(svg).toContain("Alpha");
        expect(svg).toContain("Beta");
    });
});

describe("Memory cleanup", function () {

    // --- Graph cleanup ---

    it("calling Graph methods after delete() throws", async function () {
        const graphviz = await Graphviz.load();
        const graph = graphviz.createGraph("G");
        graph.addEdge("a", "b");
        graph.delete();
        expect(() => graph.toDot()).toThrow();
        expect(() => graph.addNode("c")).toThrow();
    });

    it("calling Graph.layout() after delete() throws", async function () {
        const graphviz = await Graphviz.load();
        const graph = graphviz.createGraph("G");
        graph.addEdge("a", "b");
        graph.delete();
        expect(() => graph.layout()).toThrow();
    });

    it("double-delete on a Graph throws on the second call", async function () {
        const graphviz = await Graphviz.load();
        const graph = graphviz.createGraph("G");
        graph.delete();
        expect(() => graph.delete()).toThrow();
    });

    it("using statement triggers Graph cleanup at block exit", async function () {
        const graphviz = await Graphviz.load();
        let captured!: Graph;
        {
            using graph = graphviz.createGraph("G");
            captured = graph;
            captured.addEdge("a", "b");
        }
        // The using block has exited, so the underlying WASM object is deleted.
        expect(() => captured.toDot()).toThrow();
    });

    // --- Subgraph cleanup ---

    it("calling Subgraph methods after delete() throws", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        const sg = graph.addSubgraph("cluster_0");
        sg.delete();
        expect(() => sg.addNode("x")).toThrow();
    });

    it("double-delete on a Subgraph throws on the second call", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        const sg = graph.addSubgraph("cluster_0");
        sg.delete();
        expect(() => sg.delete()).toThrow();
    });

    it("using statement triggers Subgraph cleanup at block exit", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        let captured!: Subgraph;
        {
            using sg = graph.addSubgraph("cluster_0");
            captured = sg;
            sg.addNode("x");
        }
        // The using block has exited, so the WASM wrapper is deleted.
        expect(() => captured.addNode("y")).toThrow();
    });

    // --- Mixed lifecycle ---

    it("deleting a Subgraph wrapper before its parent Graph is safe", async function () {
        // The CSubgraph wrapper is non-owning — the underlying Agraph_t is owned
        // by the parent CGraph.  Deleting the wrapper early should not affect the
        // parent graph or its data.
        const graphviz = await Graphviz.load();
        const graph = graphviz.createGraph("G");
        const sg = graph.addSubgraph("cluster_0");
        sg.addEdge("a", "b");
        sg.delete();                    // free the thin CSubgraph wrapper
        const dot = graph.toDot();      // parent graph still intact
        graph.delete();
        expect(dot).toContain("cluster_0");
        expect(dot).toContain("a");
    });

    // --- Stress tests (no crash = no leak-induced OOM) ---

    it("stress: 100 create-layout-delete cycles complete without error", async function () {
        const graphviz = await Graphviz.load();
        for (let i = 0; i < 100; i++) {
            const graph = graphviz.createGraph(`G${i}`);
            for (let j = 0; j < 5; j++) graph.addEdge(`n${j}`, `n${j + 1}`);
            graph.layout();
            graph.delete();
        }
    });

    it("stress: 50 create-layout-delete cycles with subgraphs complete without error", async function () {
        const graphviz = await Graphviz.load();
        for (let i = 0; i < 50; i++) {
            const graph = graphviz.createGraph(`G${i}`);
            for (let c = 0; c < 3; c++) {
                const sg = graph.addSubgraph(`cluster_${c}`);
                sg.addEdge(`a${c}`, `b${c}`);
                sg.delete();
            }
            graph.layout();
            graph.delete();
        }
    });

    // --- WASM heap growth check ---

    it("WASM heap does not grow across equal batches of create-delete cycles", async function () {
        // WASM linear memory can only grow (pages are never released back to the
        // OS), but the dlmalloc allocator reuses freed blocks so the heap byte
        // length should stabilise after the first batch if objects are properly
        // freed.  If they are not freed the second batch needs fresh pages and
        // heapAfterSecond > heapAfterFirst.
        //
        // We access _module via `any` purely for this assertion — it is not part
        // of the public API.
        const graphviz = await Graphviz.load();
        const module = (graphviz as any)._module;

        const run = () => {
            for (let i = 0; i < 20; i++) {
                const graph = graphviz.createGraph("G");
                for (let j = 0; j < 10; j++) graph.addEdge(`n${j}`, `n${j + 1}`);
                graph.layout();
                graph.delete();
            }
        };

        // First batch: let any one-time allocations settle.
        run();
        const heapAfterFirst = module.HEAPU8.byteLength;

        // Second identical batch: freed blocks should be reused, no new pages.
        run();
        const heapAfterSecond = module.HEAPU8.byteLength;

        expect(heapAfterSecond).toBe(heapAfterFirst);
    });
});

describe("Raw Embind default parameters", function () {

    it("CGraphviz omitted parameters match explicitly passed C++ defaults", async function () {
        const graphviz = await Graphviz.load();
        const module = (graphviz as unknown as { _module: MainModule })._module;

        const dot = "digraph G { a -> b; b -> c; a -> c }";
        const graphVizDefault = new module.CGraphviz(1);
        const graphVizExplicit = new module.CGraphviz(1, 0);
        try {
            expect(graphVizDefault.acyclic(dot)).toBe(graphVizExplicit.acyclic(dot, false, false));

            graphVizDefault.tred(dot);
            graphVizExplicit.tred(dot, false, false);
            expect(graphVizDefault.tred_out).toBe(graphVizExplicit.tred_out);
            expect(graphVizDefault.tred_err).toBe(graphVizExplicit.tred_err);

            expect(graphVizDefault.unflatten(dot)).toBe(graphVizExplicit.unflatten(dot, 0, false, 0));
        } finally {
            graphVizDefault.delete();
            graphVizExplicit.delete();
        }
    });

    it("CGraph and CSubgraph omitted parameters match explicitly passed C++ defaults", async function () {
        const graphviz = await Graphviz.load();
        const module = (graphviz as unknown as { _module: MainModule })._module;

        const graph = new module.CGraph("G");
        try {
            graph.addEdge("a", "b");
            graph.addEdge("a", "c");
            graph.addEdge("d", "a");
            graph.addNode("n_default");

            expect(graph.hasEdge("a", "b")).toBe(graph.hasEdge("a", "b", ""));
            expect(graph.nodeDegree("a")).toBe(graph.nodeDegree("a", 1, 1));

            graph.setGraphAttr("rankdir", "LR", "TB");
            graph.setNodeAttr("a", "color", "red", "blue");
            graph.setEdgeAttr("a", "b", "", "label", "hello", "default-label");
            expect(graph.getGraphAttr("rankdir")).toBe("LR");
            expect(graph.getNodeAttr("a", "color")).toBe("red");
            expect(graph.getNodeAttr("n_default", "color")).toBe("blue");
            expect(graph.getEdgeAttr("a", "b", "", "label")).toBe("hello");
            expect(graph.getEdgeAttr("a", "c", "", "label")).toBe("default-label");

            graph.removeEdge("a", "b");
            expect(graph.hasEdge("a", "b")).toBe(false);

            graph.addEdge("a", "b");
            graph.removeEdge("a", "b", "");
            expect(graph.hasEdge("a", "b", "")).toBe(false);

            const subgraph = graph.addSubgraph("cluster_0")!;
            try {
                subgraph.addEdge("c", "d");
                subgraph.addEdge("c", "e");
                subgraph.addEdge("f", "c");
                subgraph.addNode("sg_default");

                expect(subgraph.hasEdge("c", "d")).toBe(subgraph.hasEdge("c", "d", ""));
                expect(subgraph.nodeDegree("c")).toBe(subgraph.nodeDegree("c", 1, 1));

                subgraph.setAttr("label", "Cluster", "Default Cluster");
                subgraph.setNodeAttr("c", "shape", "box", "ellipse");
                subgraph.setEdgeAttr("c", "e", "", "tooltip", "edge", "default-edge");
                expect(subgraph.getAttr("label")).toBe("Cluster");
                expect(subgraph.getNodeAttr("c", "shape")).toBe("box");
                expect(subgraph.getNodeAttr("sg_default", "shape")).toBe("ellipse");
                expect(subgraph.getEdgeAttr("c", "e", "", "tooltip")).toBe("edge");
                expect(subgraph.getEdgeAttr("f", "c", "", "tooltip")).toBe("default-edge");

                subgraph.removeEdge("c", "d");
                expect(subgraph.hasEdge("c", "d")).toBe(false);

                subgraph.addEdge("c", "d");
                subgraph.removeEdge("c", "d", "");
                expect(subgraph.hasEdge("c", "d", "")).toBe(false);
            } finally {
                subgraph.delete();
            }
        } finally {
            graph.delete();
        }
    });
});

describe("Graph mutation (remove nodes / edges / subgraphs / attrs)", function () {

    // --- removeNode ---

    it("removeNode removes a node from the DOT output", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        // Use multi-character names to avoid substring matches with DOT keywords
        // (e.g. "b" appears inside "label"; "a" appears inside "label" too).
        graph.addNode("n_kept1").addNode("n_removed").addNode("n_kept2");
        graph.removeNode("n_removed");
        const dot = graph.toDot();
        expect(dot).toContain("n_kept1");
        expect(dot).not.toContain("n_removed");
        expect(dot).toContain("n_kept2");
    });

    it("removeNode also removes connected edges", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("n_src", "n_mid").addEdge("n_mid", "n_dst");
        graph.removeNode("n_mid");
        const dot = graph.toDot();
        expect(dot).not.toContain("n_mid");
        expect(dot).not.toMatch(/n_src\s*->/);
        expect(dot).not.toMatch(/->\s*n_dst/);
    });

    it("removeNode is a no-op for non-existent node", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("p1", "p2");
        expect(() => graph.removeNode("nonexistent")).not.toThrow();
        const dot = graph.toDot();
        expect(dot).toContain("p1");
        expect(dot).toContain("p2");
    });

    // --- removeEdge ---

    it("removeEdge removes only the specified edge", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("p1", "p2").addEdge("p2", "p3");
        graph.removeEdge("p1", "p2");
        const dot = graph.toDot();
        expect(dot).toContain("p1");
        expect(dot).toContain("p2");
        expect(dot).toContain("p3");
        expect(dot).not.toMatch(/p1\s*->\s*p2/);
    });

    it("removeEdge is a no-op for non-existent edge", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("p1", "p2");
        expect(() => graph.removeEdge("p2", "p1")).not.toThrow(); // wrong direction
        expect(graph.toDot()).toMatch(/p1\s*->\s*p2/); // original edge untouched
    });

    // --- removeSubgraph ---

    it("removeSubgraph dissolves the cluster boundary; nodes/edges remain", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        {
            using c = graph.addSubgraph("cluster_0");
            c.setAttr("label", "MyCluster").addEdge("n_p", "n_q");
        }
        graph.removeSubgraph("cluster_0");
        const dot = graph.toDot();
        // The subgraph boundary is dissolved — "cluster_0" no longer appears.
        // Note: cgraph retains the proto-attribute declaration (graph [label=...])
        // as part of its attribute-type bookkeeping; that is expected behaviour.
        expect(dot).not.toContain("cluster_0");
        // Nodes and edges that were inside the cluster are now in the root graph.
        expect(dot).toContain("n_p");
        expect(dot).toContain("n_q");
    });

    it("removeSubgraph is a no-op for non-existent subgraph", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("p1", "p2");
        expect(() => graph.removeSubgraph("nonexistent")).not.toThrow();
    });

    // --- attribute removal ---

    it("removeGraphAttr clears the attribute from DOT output", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("p1", "p2");
        graph.setGraphAttr("rankdir", "LR");
        graph.removeGraphAttr("rankdir");
        const dot = graph.toDot();
        expect(dot).not.toContain("LR");
    });

    it("removeNodeAttr clears the node attribute from DOT output", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addNode("n1").setNodeAttr("n1", "color", "red");
        graph.removeNodeAttr("n1", "color");
        const dot = graph.toDot();
        expect(dot).not.toContain("red");
    });

    it("removeEdgeAttr clears the edge attribute from DOT output", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("p1", "p2").setEdgeAttr("p1", "p2", "", "label", "hello");
        graph.removeEdgeAttr("p1", "p2", "", "label");
        const dot = graph.toDot();
        expect(dot).not.toContain("hello");
    });

    // --- Subgraph-scoped remove ---

    it("Subgraph.removeNode removes from the subgraph only, not the root graph", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        // Create an edge in the root graph that references shared_node
        graph.addEdge("outer_node", "shared_node");
        {
            using c = graph.addSubgraph("cluster_0");
            c.addNode("shared_node"); // also add to cluster
            c.removeNode("shared_node"); // remove from cluster only
        }
        // shared_node is still referenced by the root-graph edge
        const dot = graph.toDot();
        expect(dot).toContain("shared_node");
        // Graph renders successfully
        expect(graph.layout()).toContain("<svg");
    });

    it("Subgraph.removeEdge removes from the subgraph only", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("p1", "p2"); // edge in root graph
        {
            using c = graph.addSubgraph("cluster_0");
            c.addEdge("p1", "p2"); // same edge referenced inside cluster
            c.removeEdge("p1", "p2"); // remove from cluster only
        }
        // The edge still exists in the root graph
        expect(graph.toDot()).toMatch(/p1\s*->\s*p2/);
    });

    it("Subgraph.removeAttr resets the attribute value on the subgraph object", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        {
            using sg = graph.addSubgraph("cluster_0");
            sg.addEdge("p1", "p2");
            sg.setAttr("label", "OriginalLabel");
            sg.removeAttr("label");           // resets the object value to ""
            sg.setAttr("label", "NewLabel");  // re-set to a new value
        }
        const dot = graph.toDot();
        // The cluster now has the new label value
        expect(dot).toContain("NewLabel");
    });

    // --- re-layout after mutation ---

    it("graph can be mutated between layout() calls", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("n_start", "n_middle").addEdge("n_middle", "n_end");

        const svg1 = graph.layout();
        expect(svg1).toContain("n_start");
        expect(svg1).toContain("n_end");

        // Remove n_middle (and its edges), then add a direct edge
        graph.removeNode("n_middle").addEdge("n_start", "n_end");

        const svg2 = graph.layout();
        expect(svg2).toContain("n_start");
        expect(svg2).toContain("n_end");
        expect(svg2).not.toContain("n_middle"); // gone from the rendered SVG
    });

    it("fluent remove chaining works", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph
            .addNode("n_a").addNode("n_b").addNode("n_c")
            .addEdge("n_a", "n_b").addEdge("n_b", "n_c")
            .setNodeAttr("n_a", "color", "red")
            .removeNode("n_b")               // removes n_b and its edges
            .removeNodeAttr("n_a", "color"); // clears color attribute
        const dot = graph.toDot();
        expect(dot).not.toContain("n_b");
        expect(dot).not.toContain("red");
        expect(dot).toContain("n_a");
        expect(dot).toContain("n_c");
    });
});

describe("Graph traversal and existence checks", function () {

    it("hasNode returns true for existing node, false for missing", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addNode("alice");
        graph.addNode("bob");

        expect(graph.hasNode("alice")).toBe(true);
        expect(graph.hasNode("bob")).toBe(true);
        expect(graph.hasNode("charlie")).toBe(false);
    });

    it("hasEdge returns true for existing edge, false for missing", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("src", "dst");

        expect(graph.hasEdge("src", "dst")).toBe(true);
        expect(graph.hasEdge("dst", "src")).toBe(false);  // directed
        expect(graph.hasEdge("src", "other")).toBe(false);
    });

    it("hasEdge with key checks a specific parallel edge", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("px", "py", "k1");
        graph.addEdge("px", "py", "k2");

        expect(graph.hasEdge("px", "py", "k1")).toBe(true);
        expect(graph.hasEdge("px", "py", "k2")).toBe(true);
        expect(graph.hasEdge("px", "py", "k3")).toBe(false);
    });

    it("hasSubgraph returns true for existing subgraph, false for missing", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        using sg = graph.addSubgraph("cluster_a");
        void sg;

        expect(graph.hasSubgraph("cluster_a")).toBe(true);
        expect(graph.hasSubgraph("cluster_b")).toBe(false);
    });

    it("getSubgraph returns a Subgraph for an existing name, null for missing", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        using created = graph.addSubgraph("cluster_get");
        created.addNode("sg_node");

        const found = graph.getSubgraph("cluster_get");
        expect(found).not.toBeNull();
        expect(found).toBeInstanceOf(Subgraph);
        found?.delete();

        const missing = graph.getSubgraph("cluster_missing");
        expect(missing).toBeNull();
    });

    it("getSubgraph returns a wrapper that can query the same subgraph data", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        {
            using sg = graph.addSubgraph("cluster_data");
            sg.addNode("data_node1");
            sg.addNode("data_node2");
            sg.addEdge("data_node1", "data_node2");
        }

        using sg2 = graph.getSubgraph("cluster_data");
        expect(sg2).not.toBeNull();
        expect(sg2!.nodeCount()).toBe(2);
        expect(sg2!.edgeCount()).toBe(1);
        expect(sg2!.nodeNames()).toContain("data_node1");
    });

    it("nodeCount returns the correct number of nodes", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");

        expect(graph.nodeCount()).toBe(0);
        graph.addNode("n1");
        expect(graph.nodeCount()).toBe(1);
        graph.addNode("n2");
        graph.addNode("n3");
        expect(graph.nodeCount()).toBe(3);
        graph.removeNode("n2");
        expect(graph.nodeCount()).toBe(2);
    });

    it("edgeCount returns the correct number of edges", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");

        expect(graph.edgeCount()).toBe(0);
        graph.addEdge("e_a", "e_b");
        expect(graph.edgeCount()).toBe(1);
        graph.addEdge("e_b", "e_c");
        expect(graph.edgeCount()).toBe(2);
        graph.removeEdge("e_a", "e_b");
        expect(graph.edgeCount()).toBe(1);
    });

    it("subgraphCount returns the correct number of subgraphs", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");

        expect(graph.subgraphCount()).toBe(0);
        using sg1 = graph.addSubgraph("cluster_1");
        void sg1;
        expect(graph.subgraphCount()).toBe(1);
        using sg2 = graph.addSubgraph("cluster_2");
        void sg2;
        expect(graph.subgraphCount()).toBe(2);
        graph.removeSubgraph("cluster_1");
        expect(graph.subgraphCount()).toBe(1);
    });

    it("nodeNames returns all node names in iteration order", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addNode("alpha");
        graph.addNode("beta");
        graph.addNode("gamma");

        const names = graph.nodeNames();
        expect(names).toHaveLength(3);
        expect(names).toContain("alpha");
        expect(names).toContain("beta");
        expect(names).toContain("gamma");
    });

    it("subgraphNames returns all subgraph names", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        using sg1 = graph.addSubgraph("cluster_x");
        using sg2 = graph.addSubgraph("cluster_y");
        void sg1; void sg2;

        const names = graph.subgraphNames();
        expect(names).toHaveLength(2);
        expect(names).toContain("cluster_x");
        expect(names).toContain("cluster_y");
    });

    it("edges() returns all edges exactly once", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("e_p", "e_q");
        graph.addEdge("e_q", "e_r");
        graph.addEdge("e_p", "e_r");

        const edgeList = graph.edges();
        expect(edgeList).toHaveLength(3);
        const tails = edgeList.map((e: EdgeInfo) => e.tail);
        const heads = edgeList.map((e: EdgeInfo) => e.head);
        expect(tails).toContain("e_p");
        expect(tails).toContain("e_q");
        expect(heads).toContain("e_q");
        expect(heads).toContain("e_r");
    });

    it("outEdges returns edges leaving the named node", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("hub", "spoke1");
        graph.addEdge("hub", "spoke2");
        graph.addEdge("spoke1", "hub"); // in-edge for hub

        const out = graph.outEdges("hub");
        expect(out).toHaveLength(2);
        expect(out.every((e: EdgeInfo) => e.tail === "hub")).toBe(true);
        expect(out.map((e: EdgeInfo) => e.head)).toContain("spoke1");
        expect(out.map((e: EdgeInfo) => e.head)).toContain("spoke2");
    });

    it("inEdges returns edges entering the named node", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("feeder1", "sink");
        graph.addEdge("feeder2", "sink");
        graph.addEdge("sink", "feeder1"); // out-edge from sink

        const inc = graph.inEdges("sink");
        expect(inc).toHaveLength(2);
        expect(inc.every((e: EdgeInfo) => e.head === "sink")).toBe(true);
        expect(inc.map((e: EdgeInfo) => e.tail)).toContain("feeder1");
        expect(inc.map((e: EdgeInfo) => e.tail)).toContain("feeder2");
    });

    it("nodeEdges returns all incident edges for a node", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("mid", "down");
        graph.addEdge("up", "mid");

        const inc = graph.nodeEdges("mid");
        // mid has one out-edge (mid→down) and one in-edge (up→mid)
        expect(inc).toHaveLength(2);
    });

    it("outEdges / inEdges return [] for nonexistent node", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addNode("solo");

        expect(graph.outEdges("ghost")).toEqual([]);
        expect(graph.inEdges("ghost")).toEqual([]);
        expect(graph.nodeEdges("ghost")).toEqual([]);
    });

    it("getGraphAttr reads a previously set graph attribute", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.setGraphAttr("label", "MyGraph");

        expect(graph.getGraphAttr("label")).toBe("MyGraph");
        expect(graph.getGraphAttr("nonexistent")).toBe("");
    });

    it("getNodeAttr reads a previously set node attribute", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addNode("nd_x");
        graph.setNodeAttr("nd_x", "color", "blue");

        expect(graph.getNodeAttr("nd_x", "color")).toBe("blue");
        expect(graph.getNodeAttr("nd_x", "missing")).toBe("");
        expect(graph.getNodeAttr("nd_ghost", "color")).toBe("");
    });

    it("getEdgeAttr reads a previously set edge attribute", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("ea", "eb");
        graph.setEdgeAttr("ea", "eb", "", "label", "myLabel");

        expect(graph.getEdgeAttr("ea", "eb", "", "label")).toBe("myLabel");
        expect(graph.getEdgeAttr("ea", "eb", "", "missing")).toBe("");
        expect(graph.getEdgeAttr("ea", "ec", "", "label")).toBe("");
    });

    it("Subgraph.hasNode / hasEdge are scoped to the subgraph", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        using sg = graph.addSubgraph("cluster_scope");
        sg.addNode("inside");
        graph.addNode("outside");

        expect(sg.hasNode("inside")).toBe(true);
        expect(sg.hasNode("outside")).toBe(false);

        graph.addEdge("inside", "outside"); // edge in root graph, not in subgraph
        expect(sg.hasEdge("inside", "outside")).toBe(false);

        sg.addEdge("sg_tail", "sg_head");
        expect(sg.hasEdge("sg_tail", "sg_head")).toBe(true);
    });

    it("Subgraph.nodeCount / edgeCount reflect subgraph membership", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        using sg = graph.addSubgraph("cluster_cnt");
        sg.addNode("sg_n1");
        sg.addNode("sg_n2");
        sg.addEdge("sg_n1", "sg_n2");

        expect(sg.nodeCount()).toBe(2);
        expect(sg.edgeCount()).toBe(1);
    });

    it("Subgraph.nodeNames returns only nodes in the subgraph", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addNode("root_only");
        using sg = graph.addSubgraph("cluster_names");
        sg.addNode("sg_member1");
        sg.addNode("sg_member2");

        const names = sg.nodeNames();
        expect(names).toHaveLength(2);
        expect(names).toContain("sg_member1");
        expect(names).toContain("sg_member2");
        expect(names).not.toContain("root_only");
    });

    it("Subgraph.edges returns only edges in the subgraph", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("root_e1", "root_e2"); // root-only edge
        using sg = graph.addSubgraph("cluster_edges");
        sg.addEdge("sg_ea", "sg_eb");

        const edgeList = sg.edges();
        expect(edgeList).toHaveLength(1);
        expect(edgeList[0]!.tail).toBe("sg_ea");
        expect(edgeList[0]!.head).toBe("sg_eb");
    });

    it("Subgraph.getAttr reads a previously set cluster attribute", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        using sg = graph.addSubgraph("cluster_attr");
        sg.setAttr("label", "ClusterLabel");

        expect(sg.getAttr("label")).toBe("ClusterLabel");
        expect(sg.getAttr("missing")).toBe("");
    });

    it("Subgraph.outEdges / inEdges / nodeEdges work within subgraph scope", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        using sg = graph.addSubgraph("cluster_trav");
        sg.addEdge("st_a", "st_b");
        sg.addEdge("st_c", "st_b");

        expect(sg.outEdges("st_a")).toHaveLength(1);
        expect(sg.inEdges("st_b")).toHaveLength(2);
        expect(sg.nodeEdges("st_b")).toHaveLength(2);
        expect(sg.outEdges("ghost_node")).toEqual([]);
    });
});

describe("nodeDegree (degree queries)", function () {

    it("nodeDegree returns total degree (in + out) by default", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("a", "b");
        graph.addEdge("a", "c");
        graph.addEdge("d", "a");

        expect(graph.nodeDegree("a")).toBe(3); // 2 out-edges + 1 in-edge
        expect(graph.nodeDegree("b")).toBe(1); // 1 in-edge
        expect(graph.nodeDegree("c")).toBe(1); // 1 in-edge
        expect(graph.nodeDegree("d")).toBe(1); // 1 out-edge
    });

    it("nodeDegree with in=1, out=0 returns in-degree only", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("a", "b");
        graph.addEdge("c", "b");
        graph.addEdge("b", "d");

        expect(graph.nodeDegree("b", 1, 0)).toBe(2); // 2 in-edges
        expect(graph.nodeDegree("a", 1, 0)).toBe(0); // 0 in-edges
        expect(graph.nodeDegree("d", 1, 0)).toBe(1); // 1 in-edge
    });

    it("nodeDegree with in=0, out=1 returns out-degree only", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("a", "b");
        graph.addEdge("a", "c");
        graph.addEdge("d", "a");

        expect(graph.nodeDegree("a", 0, 1)).toBe(2); // 2 out-edges
        expect(graph.nodeDegree("b", 0, 1)).toBe(0); // 0 out-edges
        expect(graph.nodeDegree("d", 0, 1)).toBe(1); // 1 out-edge
    });

    it("nodeDegree returns 0 for non-existent nodes", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("a", "b");

        expect(graph.nodeDegree("ghost")).toBe(0);
        expect(graph.nodeDegree("phantom", 1, 0)).toBe(0);
        expect(graph.nodeDegree("phantom", 0, 1)).toBe(0);
    });

    it("nodeDegree works with undirected graphs", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("UG", "undirected");
        graph.addEdge("a", "b");
        graph.addEdge("b", "c");
        graph.addEdge("a", "c");

        // In undirected graphs, all edges are bidirectional
        expect(graph.nodeDegree("a")).toBe(2); // connected to b and c
        expect(graph.nodeDegree("b")).toBe(2); // connected to a and c
        expect(graph.nodeDegree("c")).toBe(2); // connected to a and b
    });

    it("nodeDegree handles self-loops correctly", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("a", "a"); // self-loop
        graph.addEdge("a", "b");

        // Self-loop should contribute to degree
        expect(graph.nodeDegree("a")).toBeGreaterThanOrEqual(2);
        expect(graph.nodeDegree("b")).toBe(1);
    });

    it("nodeDegree with isolated node (no edges)", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addNode("isolated");
        graph.addEdge("a", "b");

        expect(graph.nodeDegree("isolated")).toBe(0);
        expect(graph.nodeDegree("a")).toBe(1);
    });

    it("Subgraph.nodeDegree returns degree within subgraph scope", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        // Create edges in graph root
        graph.addEdge("a", "b");
        graph.addEdge("b", "c");

        using sg = graph.addSubgraph("cluster_deg");
        sg.addEdge("b", "d");
        sg.addEdge("e", "b");

        // Subgraph degree only counts edges within the subgraph
        expect(sg.nodeDegree("b", 1, 1)).toBe(2); // 1 in-edge (e->b) + 1 out-edge (b->d)
        expect(sg.nodeDegree("b", 1, 0)).toBe(1); // 1 in-edge only
        expect(sg.nodeDegree("b", 0, 1)).toBe(1); // 1 out-edge only
    });

    it("nodeDegree increments correctly after adding edges", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addNode("x");

        expect(graph.nodeDegree("x")).toBe(0);

        graph.addEdge("a", "x");
        expect(graph.nodeDegree("x")).toBe(1);

        graph.addEdge("x", "b");
        expect(graph.nodeDegree("x")).toBe(2);

        graph.addEdge("c", "x");
        expect(graph.nodeDegree("x")).toBe(3);
    });

    it("nodeDegree decrements correctly after removing edges", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        graph.addEdge("a", "x");
        graph.addEdge("b", "x");
        graph.addEdge("x", "c");

        expect(graph.nodeDegree("x")).toBe(3);

        graph.removeEdge("a", "x");
        expect(graph.nodeDegree("x")).toBe(2);

        graph.removeEdge("x", "c");
        expect(graph.nodeDegree("x")).toBe(1);
    });

    it("nodeDegree with both in and out counts parallel edges", async function () {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("G");
        // Add multiple edges from a to b
        graph.addEdge("a", "b", "edge1");
        graph.addEdge("a", "b", "edge2");
        graph.addEdge("c", "b", "edge3");

        expect(graph.nodeDegree("b", 1, 1)).toBe(3); // 2 in-edges from a + 1 in-edge from c
    });
});
