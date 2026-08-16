<script setup>
import { onMounted, ref } from "vue";
import { Graphviz } from "../../packages/graphviz/dist/index.js";

const dot = ref(`digraph G {
  rankdir=LR;
  node [shape=box, style=rounded];
  docs -> Vue -> Graphviz -> SVG;
}`);
const svg = ref("");
const error = ref("");
const isLoading = ref(true);
const isRendering = ref(false);
let graphviz;

async function render() {
    if (!graphviz) {
        return;
    }

    isRendering.value = true;
    error.value = "";
    try {
        svg.value = graphviz.layout(dot.value, "svg", "dot");
    } catch (renderError) {
        svg.value = "";
        error.value = renderError instanceof Error ? renderError.message : String(renderError);
    } finally {
        isRendering.value = false;
    }
}

onMounted(async () => {
    try {
        graphviz = await Graphviz.load();
        await render();
    } catch (loadError) {
        error.value = loadError instanceof Error ? loadError.message : String(loadError);
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
    <div class="graphviz-demo">
        <div class="graphviz-demo__controls">
            <label for="graphviz-dot">DOT source</label>
            <textarea id="graphviz-dot" v-model="dot" spellcheck="false" />
            <button type="button" :disabled="isLoading || isRendering" @click="render">
                {{ isLoading ? "Loading Graphviz..." : isRendering ? "Rendering..." : "Render" }}
            </button>
        </div>
        <div class="graphviz-demo__output" aria-live="polite">
            <p v-if="isLoading">Loading Graphviz...</p>
            <p v-else-if="error" class="graphviz-demo__error">{{ error }}</p>
            <div v-else v-html="svg" />
        </div>
    </div>
</template>

<style scoped>
.graphviz-demo {
    display: grid;
    gap: 1rem;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    margin: 1.5rem 0;
}

.graphviz-demo__controls {
    display: grid;
    gap: 0.5rem;
}

.graphviz-demo textarea {
    box-sizing: border-box;
    min-height: 15rem;
    resize: vertical;
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    background: var(--vp-c-bg-soft);
    color: var(--vp-c-text-1);
    font-family: var(--vp-font-family-mono);
    font-size: 0.875rem;
    line-height: 1.5;
}

.graphviz-demo button {
    justify-self: start;
}

.graphviz-demo__output {
    display: grid;
    min-height: 15rem;
    place-items: center;
    overflow: auto;
    padding: 0.75rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
}

.graphviz-demo__output :deep(svg) {
    display: block;
    height: auto;
    max-width: 100%;
}

.graphviz-demo__error {
    color: var(--vp-c-danger-1);
    font-family: var(--vp-font-family-mono);
    white-space: pre-wrap;
}

@media (max-width: 640px) {
    .graphviz-demo {
        grid-template-columns: 1fr;
    }
}
</style>