# Getting Started

## Installation

By default @hpcc-js/wasm is a modern [JavaScript Module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) (ESM) package, for convenience it also includes Universal Module Definition (UMD) bundles which can be loaded in older browser / build environments.

### NPM

The simplest way to include this project is via NPM:
```sh
npm install --save @hpcc-js/wasm
```

It can then be referenced within your source code:
```js
import { Graphviz } from "@hpcc-js/wasm/graphviz";

const graphviz = await Graphviz.load();

const dot = "digraph G { Hello -> World }";
const svg = graphviz.dot(dot);
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
