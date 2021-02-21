const hpccSourcePath = "https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/index.min.js";
importScripts(hpccSourcePath);
const hpccWasm = self["@hpcc-js/wasm"];

hpccWasm.graphvizSync("https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/").then(graphviz => {
    
    self.onmessage = (e) => {
        let message = e.data;
        switch(message.type) {
            case "process":
                let { dotSource } = message.data;
                let svg = graphviz.layout(dotSource, "svg", "dot");
                self.postMessage({
                    type: "results",
                    data: { 
                        svg
                    }
                });
        }
    }
    
    self.postMessage({
        type: "ready"
    });

});

