/*
 * This class will take care of running instances of "gv-worker.js" and giving them 
 * DOT source codes to process in parallel when they are free.
 * Note: Will only process DOT (for simplicity)
 */
class GraphvizWorkerManager {

    dotSourcesQueue = new Queue();

    workers = [];
    workersCount = null;

    onSvgReady = null;
    onEverythingDone = null;

    constructor(workersCount) {
        this.workersCount = workersCount;
    }

    async initWorkers() {
        let workerInitPromises = [];

        for(let i = 0; i < this.workersCount; i++) {
            let workerInitPromise = new Promise((resolve, reject) => {
                let gvWorker = new Worker("gv-worker.js");
                
                gvWorker.onmessage = (resp) => {
                    let respData = resp.data;
                    if(respData.type == "ready") {
                        resolve();
                    }
                    else {
                        reject();
                    }
                    gvWorker.onmessage = null;
                }

                gvWorker.postMessage("init");

                gvWorker.busy = false;
                this.workers.push(gvWorker);
            });
            workerInitPromises.push(workerInitPromise);
        }

        return Promise.all(workerInitPromises);
    }

    async waitUntilDone() {
        return new Promise((resolve, reject) => {
            this.onEverythingDone = () => {
                
                resolve();
            }
        });
    }

    findFreeWorker() {
        for(let i = 0; i < this.workers.length; i++) { 
            let checkingWorker = this.workers[i];
            if(!checkingWorker.busy) {
                return checkingWorker;
            }
        }

        return null;
    }

    allWorkersFree() {
        return this.workers.every(worker => !worker.busy);
    }

    tryProcessQueueItems() {
        if(this.allWorkersFree() && this.dotSourcesQueue.size() === 0) {
            this.onEverythingDone();
        }
        else {
            while(this.findFreeWorker() !== null && this.dotSourcesQueue.size() > 0) {

                let freeWorker = this.findFreeWorker();
                let processDot = this.dotSourcesQueue.dequeue();
    
                this.processDotSourceUsingWorker(freeWorker, processDot);
            }
        }
    }

    processDotSourceUsingWorker(worker, dotSource) {
        worker.busy = true;

        worker.postMessage({
            type: "process",
            data: {
                dotSource
            }
        });

        worker.onmessage = (e) => {
            let message = e.data;
            switch(message.type) {
                case "results":
                    let svg = message.data.svg;
                    this.onSvgReady && this.onSvgReady(svg);
                    worker.busy = false;

                    this.tryProcessQueueItems();
            }
        }
    }

    processGraphvizCode(dotSource) {
        this.dotSourcesQueue.enqueue(dotSource);
        this.tryProcessQueueItems();
    }

}

class Queue {

    queueItems = [];

    enqueue(item) {
        this.queueItems.unshift(item);
    }

    dequeue() {
        return this.queueItems.pop();
    }

    size() {
        return this.queueItems.length;
    }

}