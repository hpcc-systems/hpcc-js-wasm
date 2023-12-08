# Getting Started

## Installation

By default @hpcc-js/wasm is a modern [JavaScript Module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) (ESM) package, for convenience it also includes Universal Module Definition (UMD) bundles which can be loaded in older browser / build environments.

### NPM

The simplest way to include this project is via NPM:
```sh
npm install --save @hpcc-js/wasm
```

It can then be referenced within your source code:
```ts
import { Base91, Graphviz, Zstd } from "@hpcc-js/wasm";

// Graphviz  ---
async function dot2svg() {
    const graphviz = await Graphviz.load();
    console.log("svg:  ", graphviz.dot('digraph G { Hello -> World }'));
}

dot2svg();

// Base91 + Zstd ---
const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.";
const data = new TextEncoder().encode(text);

async function compressDecompress() {
    const zstd = await Zstd.load();
    const compressed_data = zstd.compress(data);
    const base91 = await Base91.load();
    const base91Str = base91.encode(compressed_data);

    const compressed_data2 = base91.decode(base91Str);
    const data2 = zstd.decompress(compressed_data2);
    const text2 = new TextDecoder().decode(data2);

    console.log("Text Length:  ", text.length);
    console.log("Compressed Length:  ", compressed_data.length);
    console.log("Base91 Length:  ", base91Str.length);
    console.log("Passed:  ", text === text2);
}

compressDecompress();

```

### Vanilla HTML

Alternatively the @hpcc-js/wasm package can be imported directly within the html page, using a NPM CDN server like [unpkg](https://www.unpkg.com/) or [jsdelivr](https://www.jsdelivr.com/).  

For modern browsers and `import`:
```html
<script type="module">
    import { Graphviz } from "https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/graphviz.js";

    const graphviz = await Graphviz.load();
    const dot = "digraph G { Hello -> World }";
    const svg = graphviz.dot(dot);
    const div = document.getElementById("placeholder");
    div.innerHTML = graphviz.layout(dot, "svg", "dot");
</script>
```

For legacy environments you can load the UMD packages:
```html
<script src="https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/graphviz.umd.js"></script>
<script>
    var hpccWasm = window["@hpcc-js/wasm"];
    hpccWasm.Graphviz.load().then(graphviz => {
        var dot = "digraph G { Hello -> World }";
        var svg = graphviz.dot(dot);
        var div = document.getElementById("placeholder");
        div.innerHTML = graphviz.layout(dot, "svg", "dot");
    });
</script>
```
