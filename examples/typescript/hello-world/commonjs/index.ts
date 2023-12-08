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
