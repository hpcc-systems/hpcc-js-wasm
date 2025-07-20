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
    const purgeIndexNode = `https://purge.jsdelivr.net/npm/${id}${ver}/dist/index.cjs`;
    const purgeIndexUmd = `https://purge.jsdelivr.net/npm/${id}${ver}/dist/index.umd.js`;
    const purgePackage = `https://purge.jsdelivr.net/npm/${id}${ver}/package.json`;
    return Promise.all([
        get(id, purgeIndex),
        get(id, purgeIndexNode),
        get(id, purgeIndexUmd),
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