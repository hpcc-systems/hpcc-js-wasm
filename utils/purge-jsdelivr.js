import https from "https";

function get(id, url) {
    return new Promise((resolve, reject) => {
        https.get(url, resp => {
            let data = "";
            resp.on("data", (chunk) => {
                data += chunk;
            });
            resp.on("end", () => {
                resolve(data);
            });
        }).on("error", (err) => {
            reject(err);
        });
    });
}

async function purgePackage(id, ver) {
    const purgeIndex = `https://purge.jsdelivr.net/npm/${id}${ver}/dist/index.js`;
    const purgeIndexNode = `https://purge.jsdelivr.net/npm/${id}${ver}/dist/index.node.js`;
    const purgeIndexMin = `https://purge.jsdelivr.net/npm/${id}${ver}/dist/index.min.js`;
    const purgeIndexNodeMin = `https://purge.jsdelivr.net/npm/${id}${ver}/dist/index.node.min.js`;
    const purgeGraphviz = `https://purge.jsdelivr.net/npm/${id}${ver}/dist/graphvizlib.wasm`;
    const purgeExpat = `https://purge.jsdelivr.net/npm/${id}${ver}/dist/expatlib.wasm`;
    const purgePackage = `https://purge.jsdelivr.net/npm/${id}${ver}/package.json`;
    return Promise.all([
        get(id, purgeIndex),
        get(id, purgeIndexNode),
        get(id, purgeIndexMin),
        get(id, purgeIndexNodeMin),
        get(id, purgeGraphviz),
        get(id, purgeExpat),
        get(id, purgePackage)
    ]).then(responses => {
        return {
            id: `${id}${ver}`,
            responses
        };
    });
}

async function purgeAll() {
    await purgePackage("@hpcc-js/wasm", "")
        .then(console.log)
        .catch(e => console.error(e.message));
}

purgeAll();