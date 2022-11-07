# GraphViz

<!--include: ../tmp/interfaces/graphviz.Options.md-->

---
<!--@include: ../tmp/classes/graphviz.Graphviz.md-->
---

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
