import { Base91 } from "@hpcc-js/wasm/base91";

onmessage = async function (e) {
    const base91 = await Base91.load();
    const base91Str = base91.encode(e.data);
    const data = base91.decode(base91Str);
    postMessage(data);
};
