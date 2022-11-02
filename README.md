# @hpcc-js/wasm

![Test PR](https://github.com/hpcc-systems/hpcc-js-wasm/workflows/Test%20PR/badge.svg)

This repository contains a collection of useful c++ libraries compiled to WASM for (re)use in Node JS, Web Browsers and JavaScript Libraries:
- [graphviz](https://www.graphviz.org/) - v7.0.0
- [expat](https://libexpat.github.io/) - v2.4.9
- [zstd](https://github.com/facebook/zstd) - v1.5.2
- ...more to follow...

Built with:
- [emsdk](https://github.com/emscripten-core/emsdk) - v3.1.24

---

## Contents

- [Installation](#installation)
    - [NPM](#npm)
    - [Vanilla HTML](#vanilla-html)
- [GraphViz](#graphviz)
    - [Online Demos](#online-demos)
    - [Command Line Interface](#command-line-interface)
    - [Hello World](#graphviz-hello-world)
    - [API](#graphviz-api)
- [Expat](#expat)
    - [Hello World](#expat-hello-world)
    - [API](#expat-api)
- [Zstandard (zstd)](#zstandard)
    - [Hello World](#zstandard-hello-world)
    - [API](#zstandard-api)
- [Base91](#base91)
    - [Hello World](#base91-hello-world)
    - [API](#base91-api)
- [Utilities](#utility)
- [Building @hpcc-js/wasm](#building-hpcc-js-wasm)

---

## Installation

### NPM

The simplest way to include this project is via NPM:
```
npm install --save @hpcc-js/wasm
```

The @hpcc-js/wasm package includes the following files in its `dist` folder:
- `index.js` / `index.min.js`:  Browser UMD Package for all APIs.
- `index.es6.js`:  Browser ESM Package for all APIs.
- `index.node.js`:  Node CJS Package for all APIs.
- `index.node.es6.js`:  Node ESM Package for all APIs.
- `graphviz.js`:  Browser UMD Package for graphviz APIs.
- `graphviz.es6.js`:  Browser ESM Package for graphviz APIs.
- `graphvizlib.wasm`:  graphviz wasm file (loaded on demand). 
- `expat.js`:  Browser UMD Package for expat API.
- `expat.es6.js`:  Browser ESM Package for expat API.
- `expatlib.wasm`:  expat wasm file (loaded on demand).
- `expat.js`:  Browser UMD Package for zstd API.
- `zstd.es6.js`:  Browser ESM Package for zstd API.
- `zstdlib.wasm`:  zstd wasm file (loaded on demand).

**Important**:  WASM files are dynamically loaded at runtime (this is a browser / emscripten requirement), which has a few implications for the consumer:  

**Pros**:
* While this package has potentially many large WASM files, only the ones being used will ever be downloaded from your CDN / Web Server.

**Cons**:
* Most browsers don't support `fetch` and loading pages via `file://` URN, so for testing / development work you will need to run a test web server.
* Bundlers (RollupJS / WebPack) will ignore the WASM files, so you will need to manually ensure they are present in your final distribution (typically they are placed in the same folder as the bundled JS)

### Vanilla HTML

Alternatively the @hpcc-js/wasm package can be imported directly within the html page, using a NPM CDN server like [unpkg](https://www.unpkg.com/), [jsdelivr](https://www.jsdelivr.com/).  For modern browsers and `import`:

```html
<script type="module">
    import { graphvizSync } from "https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/index.es6.js";

    graphvizSync().then(graphviz => {
        const div = document.getElementById("placeholder2");
        div.innerHTML = graphviz.layout(dot, "svg", "dot");
    });
</script>
```

For legacy environments you can load the UMD packages:
```html
<script src="https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/index.min.js"></script>
<script>
    var hpccWasm = window["@hpcc-js/wasm"];

    hpccWasm.graphvizSync().then(graphviz => {
        var div = document.getElementById("placeholder2");
        div.innerHTML = graphviz.layout(dot, "svg", "dot");
    });
</script>
```

## GraphViz 

GraphViz WASM library, see [graphviz.org](https://www.graphviz.org/) for c++ details.  While this package is similar to [Viz.js](https://github.com/mdaines/viz.js), it employs a completely different build methodology derived from [GraphControl](https://github.com/hpcc-systems/GraphControl).


### Online Demos
* https://raw.githack.com/hpcc-systems/hpcc-js-wasm/trunk/index.html
* https://observablehq.com/@gordonsmith/graphviz

### Command Line Interface

To call `dot-wasm` without installing:
```
npx -p @hpcc-js/wasm dot-wasm [options] fileOrDot
```

To install the global command `dot-wasm` via NPM:
```
npm install --global @hpcc-js/wasm
```

Usage:
```
Usage: dot-wasm [options] fileOrDot

Options:
      --version      Show version number                                         [boolean]
  -K, --layout       Set layout engine (circo | dot | fdp | sfdp | neato | osage | patchwo
                     rk | twopi). By default, dot is used.
  -T, --format       Set output language to one of the supported formats (svg | dot | json
                      | dot_json | xdot_json | plain | plain-ext). By default, svg is prod
                     uced.
  -n, --neato-no-op  Sets no-op flag in neato.
                     "-n 1" assumes neato nodes have already bee
                     n positioned and all nodes have a pos attribute giving the positions.
                      It then performs an optional adjustment to remove node-node overlap,
                      depending on the value of the overlap attribute, computes the edge l
                     ayouts, depending on the value of the splines attribute, and emits th
                     e graph in the appropriate format.
                     "-n 2" Use node positions as speci
                     fied, with no adjustment to remove node-node overlaps, and use any ed
                     ge layouts already specified by the pos attribute. neato computes an
                     edge layout for any edge that does not have a pos attribute. As usual
                     , edge layout is guided by the splines attribute.
  -y, --invert-y     By default, the coordinate system used in generic output formats, suc
                     h as attributed dot, extended dot, plain and plain-ext, is the standa
                     rd cartesian system with the origin in the lower left corner, and wit
                     h increasing y coordinates as points move from bottom to top. If the
                     -y flag is used, the coordinate system is inverted, so that increasin
                     g values of y correspond to movement from top to bottom.
  -v                 Echo GraphViz library version
  -h, --help         Show help                                                   [boolean]

Examples:
  dot-wasm -K neato -T xdot ./input.dot  Execute NEATO layout and outputs XDOT format.
```

### GraphViz Hello World
```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>GraphViz WASM</title>
    <script src="https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/index.min.js"></script>
    <script>
        var hpccWasm = window["@hpcc-js/wasm"];
    </script>
</head>

<body>
    <div id="placeholder0"></div>
    <script>
        const test = `\
digraph {
    layout = neato
    splines = true
    edge [len = 2]
    a -> b
    b -> a
}`;
        hpccWasm.graphviz.layout(test, "svg", "dot").then(svg => {
            const div = document.getElementById("placeholder0");
            div.innerHTML = svg;
        });
    </script>
    <div id="placeholder1"></div>
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
            const div = document.getElementById("placeholder1");
            div.innerHTML = svg;
        });
    </script>

    <script type="module">
        import { graphvizSync } from "https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/index.es6.js";

        graphvizSync().then(graphviz => {
            const div = document.getElementById("placeholder2");
            // Synchronous call to layout
            div.innerHTML = graphviz.layout(dot, "svg", "dot");
        });
    </script>

</body>

</html>
```

### GraphViz API

The _GraphViz_ library comes in **two** flavours
* An exported `graphviz` namespace, where each API function is **asynchrounous** and returns a `Promise<string>`.
* A `graphvizSync` **asynchrounous** function which returns a `Promise<GraphvizSync>` which is a mirror instance of `graphviz`, where each API function is **synchrounous** and returns a `string`.

<a name="graphvizVersion" href="#graphvizVersion">#</a> **graphvizVersion**() · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/graphviz.ts "Source")

Returns the Graphviz Version.

<a name="layout" href="#layout">#</a> **layout**(_dotSource_[, _outputFormat_][, _layoutEngine_][, _ext_]) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/graphviz.ts "Source")

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
* sfdp
* neato
* osage
* patchwork
* twopi

See [Layout manual pages](https://www.graphviz.org/documentation/) for more information.

_ext_ optional "extra params":

* _images_: An optional `array` of 
```JavaScript
{
    path: string;   //  The path for the image.
    width: string;  //  Width of Image
    height: string; //  Height of Image
}
```
* _files_: An optional `array` of 
```JavaScript
{
    path: string;   //  The path for the file.
    data: string;   //  The data for the file.
}
```
* _wasmFolder_: An optional `string` specifying the location of wasm file.
* _wasmBinary_: An optional "pre-fetched" copy of the wasm binary as returned from `XHR` or `fetch`.
* _yInvert_: An optional boolean flag to invert the y coordinate in generic output formats (dot, xdot, plain, plain-ext).  This is equivalent to specifying -y when invoking Graphviz from the command-line. 
* _nop_: An optional number to specify "No layout" mode for the neato engine.  This is equivalent to specifying the -n option when invoking Graphviz from the command-line.

For example passing a web hosted Image to GraphViz:
```JavaScript
hpccWasm.graphviz.layout('digraph { a[image="https://.../image.png"]; }', "svg", "dot", { 
    images: [{ 
        path: "https://.../image.png", 
        width: "272px", 
        height: "92px" 
    }] 
}).then(svg => {
    document.getElementById("placeholder").innerHTML = svg;
}).catch(err => console.error(err.message));
```

<a name="circo" href="#circo">#</a> **circo**(_dotSource_[, _outputFormat_][, _ext_]) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/graphviz.ts "Source")

Convenience function that performs **circo** layout, is equivalent to `layout(dotSource, outputFormat, "circo");`.

<a name="dot" href="#dot">#</a> **dot**(_dotSource_[, _outputFormat_][, _ext_]) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/graphviz.ts "Source")

Convenience function that performs **dot** layout, is equivalent to `layout(dotSource, outputFormat, "dot");`.

<a name="fdp" href="#fdp">#</a> **fdp**(_dotSource_[, _outputFormat_][, _ext_]) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/graphviz.ts "Source")

Convenience function that performs **fdp** layout, is equivalent to `layout(dotSource, outputFormat, "fdp");`.

<a name="sfdp" href="#sfdp">#</a> **sfdp**(_dotSource_[, _outputFormat_][, _ext_]) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/graphviz.ts "Source")

Convenience function that performs **sfdp** layout, is equivalent to `layout(dotSource, outputFormat, "sfdp");`.

<a name="neato" href="#neato">#</a> **neato**(_dotSource_[, _outputFormat_][, _ext_]) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/graphviz.ts "Source")

Convenience function that performs **neato** layout, is equivalent to `layout(dotSource, outputFormat, "neato");`.

<a name="osage" href="#osage">#</a> **osage**(_dotSource_[, _outputFormat_][, _ext_]) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/graphviz.ts "Source")

Convenience function that performs **osage** layout, is equivalent to `layout(dotSource, outputFormat, "osage");`.

<a name="patchwork" href="#patchwork">#</a> **patchwork**(_dotSource_[, _outputFormat_][, _ext_]) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/graphviz.ts "Source")

Convenience function that performs **patchwork** layout, is equivalent to `layout(dotSource, outputFormat, "patchwork");`.

<a name="twopi" href="#twopi">#</a> **twopi**(_dotSource_[, _outputFormat_][, _ext_]) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/graphviz.ts "Source")

Convenience function that performs **twopi** layout, is equivalent to `layout(dotSource, outputFormat, "twopi");`.

<a name="graphvizSync" href="#graphvizSync">#</a> **graphvizSync**([_wasmFolder_], [_wasmBinary_]) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/graphviz.ts "Source")

Returns a `Promise<GraphvizSync>`, once resolved provides a synchronous variant of the above methods.  Has an optional `wasmFolder` argument to override the default wasmFolder location and optional `wasmBinary` to short circuit the wasm downloading process.

---

## Expat

Expat WASM library, provides a simplified wrapper around the Expat XML Parser library, see [libexpat.github.io](https://libexpat.github.io/) for c++ details.

### Expat Hello World
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
    <script>
        const xml = `
            <root>
                <child xxx="yyy">content</child>
            </root>
        `;

        var callback = {
            startElement(tag, attrs) { console.log("start", tag, attrs); },
            endElement(tag) { console.log("end", tag); },
            characterData(content) { console.log("characterData", content); }
        };
        hpccWasm.parse(xml, callback);
    </script>

</body>

</html>
```

### Expat API

<a name="expatVersion" href="#expatVersion">#</a> **expatVersion**() · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/expat.ts "Source")

Returns the Expat Version.

<a name="parse" href="#parse">#</a> **parse**(_xml_, _callback_) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/expat.ts "Source")

* **_xml_**:  XML String.
* **_callback_**:  Callback Object with the following methods:
    * **startElement**(_tag_: string, _attrs_: {[key: string]: string}): void;
    * **endElement**(_tag_: string): void;
    * **characterData**(_content_: string): void;

Parses the XML with suitable callbacks.

**Note:** _characterData_ may get called several times for a single tag element.

---

## Zstandard
_zstd for short_

Zstandard WASM library, provides a simplified wrapper around the Zstandard c++ library, see [Zstandard](https://facebook.github.io/zstd/) for more details.

### Zstandard Hello World

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Zstandard WASM</title>
</head>

<body>
    <div id="placeholder"></div>
    <script type="module">
        import { Zstd } from "https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/index.es6.js";

        const zstd = await Zstd.load();
        const data = new Uint8Array(Array.from({ length: 100000 }, (_, i) => i % 256));
        const compressed_data = await zstd.compress(data);
        const decompressed_data = await zstd.decompress(compressed_data);
        document.getElementById("placeholder").innerHTML = `\
        <ul>
            <li>Default Compression Level:  ${await zstd.defaultCLevel()}</li>
            <li>Decompressed Size (bytes):  ${decompressed_data.byteLength}</li>
            <li>Data Size (bytes):  ${data.byteLength}</li>
            <li>Compressed Size (bytes):  ${compressed_data.byteLength}</li>
            <li>Decompressed Size (bytes):  ${decompressed_data.byteLength}</li>
        </ul>
        `;
    </script>

</body>

</html>
```

### Zstandard API

#### Interfaces

<a name="Options" href="#ZstandardOptions">#</a> **Options** · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/zstd.ts "Source")

Options structure for advanced loading.

```typescript
interface Options {
    wasmFolder?: string;
    wasmBinary?: ArrayBuffer;
}
```

* _wasmFolder_: An optional `string` specifying the location of wasm file.
* _wasmBinary_: An optional "pre-fetched" copy of the wasm binary as returned from `XHR` or `fetch`.

<a name="Zstd" href="#Zstd">#</a> **Zstd** · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/zstd.ts "Source")

Conceptual interface for TypeScript/JavaScript wrapper API

```typescript
interface Zstd {
    static load(options?: Options): Promise<Zstd>;
    version(): string;

    compress(data: Uint8Array, compressionLevel: number = this.defaultCLevel()): Uint8Array;
    decompress(array: Uint8Array): Uint8Array;
    defaultCLevel(): number;
}
```

<a name="zstdLoad" href="#zstdLoad">#</a> **Zstd.load**(_options_?: **Options**): **Promise\<Zstd\>** · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/zstd.ts "Source")

Loads and initializes the Zstandard wasm library, returns a Promise to `Zstd`:
```typescript
const zstd = await Zstd.load();
...dostuff...
```
or
```typescript
Zstd.load().then(zstd => {...dostuff...});
```

<a name="zstdVersion" href="#zstdVersion">#</a> **zstd.version**(): **string** · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/zstd.ts "Source")

* **_returns_**:  The Zstandard library Version.

<a name="zstdCompress" href="#zstdCompress">#</a> **zstd.compress**(_data_: **Uint8Array**, _compressionLevel_?: **number**): **Uint8Array** · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/zstd.ts "Source")

* **_data_**:  Raw data to compress.
* **_compressionLevel_**:  Compression v Speed tradeoff, when omitted it will default to `zstd.defaultCLevel()` which is currently 3.
* **_returns_**:  Compressed data.

Compresses raw data.  

A note on compressionLevel:  The library supports regular compression levels from 1 up 22. Levels >= 20, should be used with caution, as they require more memory. The library also offers negative compression levels, which extend the range of speed vs. ratio preferences.  The lower the level, the faster the speed (at the cost of compression).

<a name="zstdDefaultCLevel" href="#zstdDefaultCLevel">#</a> **zstd.defaultCLevel**(): **number** · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/zstd.ts "Source")

* **_returns_**:  Default compression level (see above).

---

## Base91
_Similar to Base 64, but uses more characters resulting in smaller strings._

Base 91 WASM library, similar to Base 64 but uses more characters resulting in smaller strings, see [Base91](https://base91.sourceforge.net/) for more details.

### Base91 Hello World

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Base91 WASM</title>
</head>

<body>
    <div id="placeholder"></div>
    <script type="module">
        import { Base91 } from "./dist/index.es6.js";
        //import { Base91 } from "https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/index.es6.js";

        const base91 = await Base91.load();
        const data = new Uint8Array(Array.from({ length: 100 }, (_, i) => Math.random() * 100));
        const encoded_data = await base91.encode(data);
        const decoded_data = await base91.decode(encoded_data);
        document.getElementById("placeholder").innerHTML = `\
        <ul>
            <li>Data Size (bytes):  ${data.byteLength}</li>
            <li>Endoded Size (bytes):  ${encoded_data.length}</li>
            <li>Decoded Size (bytes):  ${decoded_data.byteLength}</li>
        </ul>
        <h4>Data:  </h4>
        <code>
            ${data}
        </code>
        <h4>Base 91:  </h4>
        <code id="base91">
        </code>
        <h4>Decoded:  </h4>
        <code>
            ${decoded_data}
        </code>
        `;
        document.getElementById("base91").innerText = encoded_data;
    </script>

</body>

</html>
```

### Base91 API

#### Interfaces

<a name="Options" href="#Base91Options">#</a> **Options** · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/base91.ts "Source")

Options structure for advanced loading.

```typescript
interface Options {
    wasmFolder?: string;
    wasmBinary?: ArrayBuffer;
}
```

* _wasmFolder_: An optional `string` specifying the location of wasm file.
* _wasmBinary_: An optional "pre-fetched" copy of the wasm binary as returned from `XHR` or `fetch`.

<a name="Base91" href="#Base91">#</a> **Base91** · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/base91.ts "Source")

Conceptual interface for TypeScript/JavaScript wrapper API

```typescript
interface Base91 {
    static load(options?: Options): Promise<Base91>;
    version(): string;

    encode(data: Uint8Array): string;
    decode(array: string): Uint8Array;
}
```

<a name="base91Load" href="#base91Load">#</a> **Base91.load**(_options_?: **Options**): **Promise\<Base91\>** · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/base91.ts "Source")

Loads and initializes the Base91 wasm library, returns a Promise to `Base91`:
```typescript
const base91 = await Base91.load();
...dostuff...
```
or
```typescript
Base91.load().then(base91 => {...dostuff...});
```

<a name="base91Version" href="#base91Version">#</a> **base91.version**(): **string** · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/base91.ts "Source")

* **_returns_**:  The Base91 library Version.

<a name="base91Encode" href="#base91Encode">#</a> **base91.encode**(_data_: **Uint8Array**): **string** · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/base91.ts "Source")

* **_data_**:  Raw data to encode.
* **_returns_**:  Encoded string.

Encodes the raw data.  

<a name="base91Decode" href="#base91Decode">#</a> **base91.decode**(_str_: **string**): **Uint8Array** · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/base91.ts "Source")

* **_str_**:  String to decode.
* **_returns_**:  Decoded data.

Decodes the raw data.  

---

## Utility

Utility functions unrelated to any specific wasm APIs

<a name="wasmFolder" href="#wasmFolder">#</a> **wasmFolder**([_url_]) · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/util.ts "Source")

If _url_ is specified, sets the default location for all WASM files.  If _url_ is not specified it returns the current _url_ (defaults to `undefined`).

<a name="__hpcc_wasmFolder" href="#__hpcc_wasmFolder">#</a> **__hpcc_wasmFolder** · [<>](https://github.com/hpcc-systems/hpcc-js-wasm/blob/trunk/src/util.ts "Source")

Global variable for setting default WASM location, this is an alternative to [wasmFolder](#wasmFolder)

---

## Building @hpcc-js/wasm
_Building is supported on both Linux (tested with Ubuntu 20.04) and Windows with WSL enabled (Ubuntu-20.04).  Building in other environments should work, but may be missing certain prerequisites._

These are then known required OS dependencies (see [./docker/ubuntu-dev.dockerfile](./docker/ubuntu-dev.dockerfile) for test script):
```
sudo apt-get install -y curl
sudo curl --silent --location https://deb.nodesource.com/setup_16.x | sudo bash -
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential

sudo apt-get install -y git cmake wget
sudo apt-get install -y gcc-multilib g++-multilib pkg-config autoconf bison libtool flex zlib1g-dev 
sudo apt-get install -y python3 python3-pip
```

### Build steps:
```
git clone https://github.com/hpcc-systems/hpcc-js-wasm.git
cd hpcc-js-wasm
npm ci
npm run install-build-deps
npm run build
```

**Note**: The `install-build-deps` downloads the following dependencies:
* [Emscripten SDK](https://emscripten.org/)
* [GraphViz](https://www.graphviz.org/)
* [Expat](https://libexpat.github.io/)

This has been made a manual step as the downloads are quite large and the auto-configuration can be time consuming.

### Clean dependencies: 
_It is worth noting that `npm run clean` will only clean any artifacts associated with the build, but won't clean clean any of the third party dependencies.  To remove those for a "full clean", run:_
```
npm run uninstall-build-deps
```
