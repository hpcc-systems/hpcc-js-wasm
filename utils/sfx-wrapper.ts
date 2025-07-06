import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { Base91 } from "@hpcc-js/wasm-base91";
import { Zstd } from "@hpcc-js/wasm-zstd";
import type { Plugin, PluginBuild } from "esbuild";

function tpl(wasmJsPath: string, base91Wasm: string, base91CompressedWasm: string) {

    const compressed = (base91CompressedWasm.length + 8 * 1024) <= base91Wasm.length;
    const wasmJsExists = existsSync(wasmJsPath);

    return `\
${compressed ? 'import { decompress } from "fzstd";' : ""}
${wasmJsExists ? `import wrapper from "${wasmJsPath}";` : ""}

const table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_\`{|}~"';

function decode(raw: string): Uint8Array {
    const len = raw.length;
    const ret: number[] = [];

    let b = 0;
    let n = 0;
    let v = -1;

    for (let i = 0; i < len; i++) {
        const p = table.indexOf(raw[i]);
        /* istanbul ignore next */
        if (p === -1) continue;
        if (v < 0) {
            v = p;
        } else {
            v += p * 91;
            b |= v << n;
            n += (v & 8191) > 88 ? 13 : 14;
            do {
                ret.push(b & 0xff);
                b >>= 8;
                n -= 8;
            } while (n > 7);
            v = -1;
        }
    }

    if (v > -1) {
        ret.push((b | v << n) & 0xff);
    }

    return new Uint8Array(ret);
}

const blobStr = '${compressed ? base91CompressedWasm : base91Wasm}';

let g_module: Uint8Array | undefined;
let g_wasmBinary: Uint8Array | undefined;
export default function() {
    if (!g_wasmBinary) {
        g_wasmBinary = ${compressed ? "decompress(decode(blobStr))" : "decode(blobStr)"};
    }
${!wasmJsExists ? `\
    return g_wasmBinary;
`: `\
    if (!g_module) {
        g_module = wrapper({
            wasmBinary: g_wasmBinary,
            locateFile: (name: string) => "sfx-wrapper nop"
        });
    }
    return g_module;
`}
}

export function reset() {
    if (g_module) {
        g_module = undefined;
    }
} `.trim();
}

export async function wrap(path: string) {
    const base91 = await Base91.load();
    const zstd = await Zstd.load();

    const wasm = await readFile(path);
    path = path.replace(/\.js$/, ".xxx");
    const wasmJsPath = path.replace(/\.wasm$/, ".js");
    const base91Wasm = base91.encode(wasm);
    const compressedWasm = zstd.compress(wasm);
    const base91CompressedWasm = base91.encode(compressedWasm);

    return tpl(wasmJsPath, base91Wasm, base91CompressedWasm);
}

export function sfxWasm(): Plugin {
    return {
        name: "sfx-wasm",

        setup(build: PluginBuild) {

            build.onLoad({ filter: /\.wasm$/ }, async args => {
                return {
                    contents: await wrap(args.path),
                    loader: "ts",
                };
            });
        }
    };
}
