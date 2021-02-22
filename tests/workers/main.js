
let mergeDotSourceLines = (dotSourceLines) => {
    return `
        digraph regexp {
            ${dotSourceLines.join("\n")}
        }
    `;
};

// Durstenfeld shuffle
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function addBreak(count) {
    for(let i = 0; i < count; i++) {
        document.body.prepend(document.createElement(`br`));
    }
}

let startProcessing = async () => {
    let startTime;

    const workersCount = document.getElementById("cores-count").value;
    document.body.innerHTML = "";

    const graphvizInputsCount = 500;

    let dotSources = [];

    for(let i = 0; i < graphvizInputsCount; i++) {
        shuffleArray(dotSourceLines);
        let finalDotSource = mergeDotSourceLines(dotSourceLines);
        dotSources.push(finalDotSource);
    }

    // Note: Will only be able to process DOT (for simplicity)
    const GVWorkerManager = new GraphvizWorkerManager(workersCount);

    await GVWorkerManager.initWorkers();

    let svgResults = [];

    GVWorkerManager.onSvgReady = svg => {
        let svgContainer = document.createElement("div");

        svgContainer.setAttribute("class", "svg-container");

        svgResults.push(svg);

        document.body.appendChild(svgContainer);
    };

    for(let i = 0; i < graphvizInputsCount; i++) {
        let dotSource = dotSources[i];
        GVWorkerManager.processGraphvizCode(dotSource);
    }

    startTime = Date.now();
    await GVWorkerManager.waitUntilDone();
    let elapsedTime = Date.now() - startTime;

    addBreak(3);
    document.body.prepend(document.createTextNode(`Done! It took ${elapsedTime} milliseconds to process ${graphvizInputsCount} DOT source codes using ${workersCount} process(es).`));
    addBreak(3);

    setTimeout(() => {
        let resultContainers = document.querySelectorAll(".svg-container");
        svgResults.forEach((svg, i) => {
            resultContainers[i].innerHTML = svg;
        });
    }, 100);
    
};