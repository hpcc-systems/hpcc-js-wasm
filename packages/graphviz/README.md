---
title: Graphviz
description: WebAssembly wrapper for the Graphviz graph visualization library
outline: deep
---

# @hpcc-js/wasm-graphviz

This package provides a WebAssembly wrapper around the [Graphviz](https://www.graphviz.org/) library. This allows for the rendering of DOT language graphs directly within a browser or NodeJS type environment.

## Installation

::: code-group

```sh [npm]
npm install @hpcc-js/wasm-graphviz
```

```sh [yarn]
yarn add @hpcc-js/wasm-graphviz
```

```sh [pnpm]
pnpm add @hpcc-js/wasm-graphviz
```

:::

## Quick Start

```typescript
import { Graphviz } from "@hpcc-js/wasm-graphviz";

const graphviz = await Graphviz.load();
const svg = graphviz.dot(`digraph { a -> b; }`);
document.body.innerHTML = svg;
```

## Programmatic Graph Construction

Instead of writing DOT source by hand you can build graphs programmatically using
`createGraph`. The resulting `Graph` object can be rendered directly via
`graph.layout()` or serialised to DOT first with `graph.write()` / `graph.toDot()`.

Attribute names and values follow Graphviz itself; see the official Graphviz
[attribute reference](https://graphviz.org/docs/attrs/) for the supported graph,
node, edge, and cluster attributes.

Existing DOT can also be parsed into a mutable graph with `read`, and any
programmatic graph can be written back to DOT with `write` (`toDot` is an alias).

### Basic usage

```typescript
import { Graphviz } from "@hpcc-js/wasm-graphviz";

const graphviz = await Graphviz.load();

// createGraph returns a Graph; always call delete() when done (or use `using`)
using graph = graphviz.createGraph("G");

graph
  .addNode("a")
  .addNode("b")
  .addEdge("a", "b")
  .setNodeAttr("a", "shape", "box")
  .setNodeAttr("a", "color", "red")
  .setGraphAttr("rankdir", "LR");

// Render directly — no DOT round-trip needed
const svg = graph.layout("svg", "dot");
document.body.innerHTML = svg;
```

```typescript
using graph = graphviz.read(`digraph G { a -> b [label="hello"] }`);
graph.setGraphAttr("rankdir", "LR");
const dot = graph.write();
```

### Graph types

```typescript
// "directed" (default) | "undirected" | "strict directed" | "strict undirected"
using graph = graphviz.createGraph("G", "undirected");
graph.addEdge("x", "y");
```

### Mutating a graph between layouts

Nodes, edges, subgraphs, and attributes can all be removed after an initial
`layout()` call, allowing the graph to be updated and re-rendered without
rebuilding from scratch.

```typescript
using graph = graphviz.createGraph("G");
graph.addEdge("a", "b").addEdge("b", "c");
const svg1 = graph.layout(); // initial render

// Remove the middle node (also removes its edges), add a direct edge
graph.removeNode("b").addEdge("a", "c");
const svg2 = graph.layout(); // updated render
```

The full set of mutation methods on `Graph`:

| Method                                  | Effect                                                              |
| --------------------------------------- | ------------------------------------------------------------------- |
| `removeNode(name)`                      | Removes the node and all its edges from the root graph              |
| `removeEdge(tail, head, key?)`          | Removes a single edge                                               |
| `removeSubgraph(name)`                  | Dissolves a cluster boundary (nodes/edges remain in the root graph) |
| `removeGraphAttr(attr)`                 | Resets a graph-level attribute to its default                       |
| `removeNodeAttr(node, attr)`            | Resets a node attribute to its default                              |
| `removeEdgeAttr(tail, head, key, attr)` | Resets an edge attribute to its default                             |

`Subgraph` has the same `removeNode` / `removeEdge` pair (scoped to the
subgraph only — root graph is unaffected) plus `removeAttr` /
`removeNodeAttr` / `removeEdgeAttr`.

### Existence checks and graph traversal

`Graph` and `Subgraph` expose methods for querying membership and iterating
the contents of a graph without serialising to DOT.

#### Existence checks

```typescript
using graph = graphviz.createGraph("G");
graph.addNode("alice");
graph.addEdge("alice", "bob");
graph.addSubgraph("cluster_a");

graph.hasNode("alice"); // true
graph.hasNode("charlie"); // false
graph.hasEdge("alice", "bob"); // true  (key defaults to "")
graph.hasEdge("bob", "alice"); // false (directed)
graph.hasSubgraph("cluster_a"); // true
```

#### Count queries

```typescript
graph.nodeCount(); // number of nodes
graph.edgeCount(); // number of edges
graph.subgraphCount(); // number of direct subgraphs
```

#### Reading attributes

```typescript
graph.setNodeAttr("alice", "color", "red");
graph.setEdgeAttr("alice", "bob", "", "label", "hello");
graph.setGraphAttr("rankdir", "LR");

graph.getNodeAttr("alice", "color"); // "red"
graph.getEdgeAttr("alice", "bob", "", "label"); // "hello"
graph.getGraphAttr("rankdir"); // "LR"
graph.getNodeAttr("alice", "missing"); // "" (unknown attr)

// Omit the value to reset an attribute to Graphviz's default empty value.
graph.setNodeAttr("alice", "color");
graph.getNodeAttr("alice", "color"); // ""

// Pass a final defaultValue argument to declare Graphviz's default for unset objects.
graph.addNode("charlie");
graph.setNodeAttr("alice", "color", "red", "blue");
graph.getNodeAttr("charlie", "color"); // "blue"

// Or declare defaults directly for graph, node, and edge attributes.
graph.setDefaultNodeAttr("shape", "box");
graph.setDefaultEdgeAttr("color", "red");

// Use HTML-like attributes for Graphviz HTML labels.
graph.setNodeHtmlAttr("alice", "label", "<B>Alice</B>");
```

#### Node / edge / subgraph lists

```typescript
// Returns string[]
const nodes = graph.nodeNames();
const subgraphs = graph.subgraphNames();

// Returns EdgeInfo[] — { tail: string, head: string, key: string }
const allEdges = graph.edges(); // every edge exactly once
const outgoing = graph.outEdges("alice"); // edges leaving alice
const incoming = graph.inEdges("bob"); // edges entering bob
const incident = graph.nodeEdges("alice"); // all edges on alice (in + out)
```

`Subgraph` exposes the same traversal API (scoped to the subgraph's node/edge
set), except `hasSubgraph` / `subgraphCount` / `subgraphNames` which are only
on `Graph`.

### Subgraphs and clusters

Names beginning with `"cluster"` are drawn as bounded rectangles by most
layout engines.

```typescript
using graph = graphviz.createGraph("G");

// Each Subgraph wrapper also needs to be deleted (or use `using`)
{
  using cluster = graph.addSubgraph("cluster_0");
  cluster
    .setAttr("label", "My Cluster")
    .setAttr("style", "filled")
    .setAttr("color", "lightblue")
    .addEdge("a", "b");
}

const svg = graph.layout();
```

### Memory management

Every `Graph` and `Subgraph` wraps a native WASM object. You must release it
when finished to avoid memory leaks:

- **Preferred — `using` keyword** (TypeScript ≥ 5.2 with `"target": "ES2022"` or later):

  ```typescript
  {
    using graph = graphviz.createGraph("G");
    // ... graph is automatically deleted when the block exits
  }
  ```

- **Manual `delete()`**:
  ```typescript
  const graph = graphviz.createGraph("G");
  try {
    // ...
  } finally {
    graph.delete();
  }
  ```

Subgraph wrappers follow the same rule. The underlying subgraph _data_ is
owned by the parent `Graph` and freed automatically when the parent is deleted;
only the thin JS wrapper needs an explicit `delete()` / `using` block.

<!--@include: ../../docs/graphviz/src/graphviz/README.md-->

## Reference

- [API Documentation](https://hpcc-systems.github.io/hpcc-js-wasm/docs/graphviz/src/graphviz/classes/Graphviz.html)
