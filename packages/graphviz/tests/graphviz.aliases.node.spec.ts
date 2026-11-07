import { describe, expect, it } from "vitest";
import { Graphviz } from "@hpcc-js/wasm-graphviz";

describe("Graph and Subgraph aliases", () => {
    it("covers node aliases, attributes, queries, and traversal", async () => {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("aliases");

        graph
            .setGraphHtmlAttr("label", "<B>Graph</B>")
            .setDefaultGraphHtmlAttr("tooltip", "graph")
            .setDefaultVertexAttr("color", "blue")
            .setDefaultNodeHtmlAttr("label", "<B>Node</B>")
            .setDefaultVertexHtmlAttr("tooltip", "node")
            .setDefaultEdgeHtmlAttr("label", "<I>Edge</I>")
            .addVertex("a")
            .addVertex({ id: "b", attrs: { shape: "box" } })
            .addEdge("a", "b");

        graph
            .setVertexAttr("a", "color", "red")
            .setVertexAttr("b", "shape", "ellipse", "box")
            .setVertexHtmlAttr("a", "label", "<B>A</B>")
            .setVertexHtmlAttr("b", "tooltip", "target", "default")
            .setDefaultVertexAttr("fontname", "Helvetica")
            .setDefaultVertexHtmlAttr("xlabel", "<I>Node</I>")
            .setDefaultEdgeHtmlAttr("tooltip", "edge")
            .setEdgeHtmlAttr("a", "b", "", "label", "<I>linked</I>")
            .setEdgeHtmlAttr("a", "b", "", "tooltip", "edge", "default")
            .removeNodeAttr("a", "color");

        expect(graph.hasVertex("a")).toBe(true);
        expect(graph.hasEdge("a", "b")).toBe(true);
        expect(graph.vertexCount()).toBe(2);
        expect(graph.vertexDegree("a")).toBe(1);
        expect(graph.getVertexAttr("b", "shape")).toBe("ellipse");
        expect(graph.vertexNames()).toEqual(expect.arrayContaining(["a", "b"]));
        expect(graph.outEdgesFrom("a")).toHaveLength(1);
        expect(graph.inEdgesTo("b")).toHaveLength(1);
        expect(graph.vertexEdges("a")).toHaveLength(1);
        expect(graph.getGraphAttr("tooltip")).toBe("graph");

        graph.removeVertexAttr("b", "shape");
        graph.removeEdgeAttr("a", "b", "", "label");
        graph.removeVertex("b");
        expect(graph.hasVertex("b")).toBe(false);
    });

    it("covers subgraph aliases, defaults, and lookup", async () => {
        const graphviz = await Graphviz.load();
        using graph = graphviz.createGraph("subgraph-aliases");
        using subgraph = graph.addSubgraph("cluster-a", { label: "A" });

        subgraph
            .setDefaultHtmlAttr("tooltip", "cluster")
            .addVertex("inside")
            .addEdge("inside", "outside")
            .setVertexAttr("inside", "color", "red")
            .setVertexHtmlAttr("inside", "label", "<B>Inside</B>")
            .setDefaultVertexAttr("shape", "box")
            .setDefaultNodeHtmlAttr("xlabel", "<I>Node</I>")
            .setDefaultVertexHtmlAttr("tooltip", "node")
            .setDefaultEdgeHtmlAttr("label", "<I>Edge</I>")
            .removeVertexAttr("inside", "color");

        expect(subgraph.hasVertex("inside")).toBe(true);
        expect(subgraph.hasEdge("inside", "outside")).toBe(true);
        expect(subgraph.vertexCount()).toBe(2);
        expect(subgraph.vertexDegree("inside")).toBe(1);
        expect(subgraph.getVertexAttr("inside", "color")).toBe("");
        expect(subgraph.vertexNames()).toEqual(expect.arrayContaining(["inside", "outside"]));

        expect(graph.hasSubgraph("cluster-a")).toBe(true);
        expect(graph.subgraphNames()).toContain("cluster-a");
        expect(graph.getSubgraph("cluster-a")).not.toBeNull();
        expect(graph.getSubgraph("missing")).toBeNull();
        graph.removeSubgraph("cluster-a");
        expect(graph.hasSubgraph("cluster-a")).toBe(false);
    });
});
