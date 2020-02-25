# @hpcc-js/wasm

[![Build Status](https://travis-ci.org/hpcc-systems/hpcc-js-wasm.svg?branch=master)](https://travis-ci.org/hpcc-systems/hpcc-js-wasm)

This repository contains a collection of useful c++ libraries compiled to WASM for (re)use in Web Browsers and JavaScript Libraries.

## Installation 
The simplest way to include this project is via NPM:
```
npm install --save @hpcc-js/wasm
```

## Contents
@hpcc-js/wasm includes the following files in its `dist` folder:
* `index.js` / `index.min.js` files:  Exposes _all_ the available APIs for all WASM files.
* WASM Files:
    * `graphvizlib.wasm`
    * ...more to follow...

**Important**:  WASM files are dynamically loaded at runtime (this is a browser / emscripten requirement), which has a few implications for the consumer:  

**Pros**:
* While this package has potentially many large WASM files, only the ones being used will ever be downloaded from your CDN / Web Server.

**Cons**:
* Most browsers don't support `fetch` and loading pages via `file://` URN, so for testing / development work you will need to run a test web server.
* Bundlers (RollupJS / WebPack) will ignore the WASM files, so you will need to manually ensure they are present in your final distribution (typically they are placed in the same folder as the bundled JS)

## API Reference
* [Common](#common)
* [GraphViz](#graphviz)

### Common
Utility functions relating to @hpcc-js/wasm as a package

<a name="wasmFolder" href="#wasmFolder">#</a> **wasmFolder**([_url_]) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/master/src/util.ts "Source")

If _url_ is specified, sets the default location for all WASM files.  If _url_ is not specified it returns the current _url_ (defaults to `undefined`).

<a name="__hpcc_wasmFolder" href="#__hpcc_wasmFolder">#</a> **__hpcc_wasmFolder** · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/master/src/util.ts "Source")

Global variable for setting default WASM location, this is an alternative to [wasmFolder](#wasmFolder)

### GraphViz (`graphvizlib.wasm`)
GraphViz WASM library, see [graphviz.org](https://www.graphviz.org/) for c++ details.  While this package is similar to [Viz.js](https://github.com/mdaines/viz.js), it employs a completely different build methodology taken from [GraphControl](https://github.com/hpcc-systems/GraphControl).

The _GraphViz_ library comes in **two** flavours
* An exported `graphviz` namespace, where each API function is **asynchrounous** and returns a `Promise<string>`.
* A `graphvizSync` **asynchrounous** function which returns a `Promise<GraphvizSync>` which is a mirror instance of `graphviz`, where each API function is **synchrounous** and returns a `string`.

#### Hello World
```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>GraphViz WASM</title>
    <script src="https://unpkg.com/@hpcc-js/wasm/dist/index.min.js"></script>
    <script>
        var hpccWasm = window["@hpcc-js/wasm"];
    </script>
</head>

<body>
    <div id="placeholder"></div>
    <div id="placeholder2"></div>
    <script>
        const dot = `
            digraph G {
                node [shape=rect];

                subgraph cluster_0 {
                    style=filled;
                    color=lightgrey;
                    node [style=filled,color=white];
                    a0 -> a1 -> a2 -> a3;
                    label = "Hello";
                }

                subgraph cluster_1 {
                    node [style=filled];
                    b0 -> b1 -> b2 -> b3;
                    label = "World";
                    color=blue
                }

                start -> a0;
                start -> b0;
                a1 -> b3;
                b2 -> a3;
                a3 -> a0;
                a3 -> end;
                b3 -> end;

                start [shape=Mdiamond];
                end [shape=Msquare];
            }
        `;

        // Asynchronous call to layout
        hpccWasm.graphviz.layout(dot, "svg", "dot").then(svg => {
            const div = document.getElementById("placeholder");
            div.innerHTML = svg;
        });

        hpccWasm.graphvizSync().then(graphviz => {
            const div = document.getElementById("placeholder2");
            // Synchronous call to layout
            div.innerHTML = graphviz.layout(dot, "svg", "dot");
        });
    </script>

</body>

</html>
```

#### GraphViz API

<a name="layout" href="#layout">#</a> **layout**(_dotSource_[, _outputFormat_][, _layoutEngine_]) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/master/src/graphviz.ts "Source")

Performs layout for the supplied _dotSource_, see [The DOT Language](https://graphviz.gitlab.io/_pages/doc/info/lang.html) for specification.  

_outputFormat_ supports the following options:
* dot
* dot_json
* json
* svg (default)
* xdot_json

See [Output Formats](https://graphviz.gitlab.io/_pages/doc/info/output.html) for more information.

_layoutEngine_ supports the following options:
* circo
* dot (default)
* fdp
* neato
* osage
* patchwork
* twopi

See [Layout manual pages](https://www.graphviz.org/documentation/) for more information.

<a name="circo" href="#circo">#</a> **circo**(_dotSource_[, _outputFormat_]) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/master/src/graphviz.ts "Source")

Convenience function that performs **circo** layout, is equivalent to `layout(dotSource, outputFormat, "circo");`.

<a name="dot" href="#dot">#</a> **dot**(_dotSource_[, _outputFormat_]) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/master/src/graphviz.ts "Source")

Convenience function that performs **dot** layout, is equivalent to `layout(dotSource, outputFormat, "dot");`.

<a name="fdp" href="#fdp">#</a> **fdp**(_dotSource_[, _outputFormat_]) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/master/src/graphviz.ts "Source")

Convenience function that performs **circo** layout, is equivalent to `layout(dotSource, outputFormat, "fdp");`.

<a name="neato" href="#neato">#</a> **neato**(_dotSource_[, _outputFormat_]) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/master/src/graphviz.ts "Source")

Convenience function that performs **neato** layout, is equivalent to `layout(dotSource, outputFormat, "neato");`.

<a name="osage" href="#osage">#</a> **osage**(_dotSource_[, _outputFormat_]) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/master/src/graphviz.ts "Source")

Convenience function that performs **osage** layout, is equivalent to `layout(dotSource, outputFormat, "osage");`.

<a name="patchwork" href="#patchwork">#</a> **patchwork**(_dotSource_[, _outputFormat_]) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/master/src/graphviz.ts "Source")

Convenience function that performs **patchwork** layout, is equivalent to `layout(dotSource, outputFormat, "patchwork");`.

<a name="twopi" href="#twopi">#</a> **twopi**(_dotSource_[, _outputFormat_]) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/master/src/graphviz.ts "Source")

Convenience function that performs **twopi** layout, is equivalent to `layout(dotSource, outputFormat, "twopi");`.

## Building @hpcc-js/wasm
_Building is supported on both Linux (tested with Ubuntu 18.04) and Windows (with WSL installed)_

There are several required OS dependencies which can be installed with:
```
sudo ./scripts/cpp-install-prerequisites.sh
```
(See [./scripts/cpp-install-prerequisites.sh](./scripts/cpp-install-prerequisites.sh) for details)

### Build steps:
```
git clone https://github.com/hpcc-systems/hpcc-js-wasm.git
cd hpcc-js-wasm
npm ci
npm run install-build-deps
npm run build
```

**Note**: The `install-build-deps` downloads both the Emscripten SDK and the GraphViz sources.  This has been made a manual step as the downloads are quite large and the auto-configuration can be time consuming.

