<script setup>
import { ref } from "vue";
import { Llama } from "../../packages/llama/dist/index.js";

const prompt = ref("Write one concise sentence about WebAssembly.");
const output = ref("");
const error = ref("");
const isRunning = ref(false);
let model;

async function selectModel(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    error.value = "";
    output.value = `Loaded ${file.name}.`;
    model = new Uint8Array(await file.arrayBuffer());
}

async function run() {
    if (!model) {
        error.value = "Select a local .gguf model first.";
        return;
    }
    isRunning.value = true;
    error.value = "";
    try {
        const llama = await Llama.load();
        const result = llama.chat(prompt.value, model, { args: ["--temp", "0.2", "-n", "96"] });
        output.value = result;
    } catch (runError) {
        error.value = runError instanceof Error ? runError.message : String(runError);
    } finally {
        isRunning.value = false;
    }
}
</script>

<template>
    <div class="llama-demo">
        <label for="llama-model">Local GGUF model</label>
        <input id="llama-model" type="file" accept=".gguf" @change="selectModel" />
        <label for="llama-prompt">Prompt</label>
        <textarea id="llama-prompt" v-model="prompt" />
        <button type="button" :disabled="isRunning" @click="run">{{ isRunning ? "Generating..." : "Generate" }}</button>
        <p v-if="error" class="llama-demo__error">{{ error }}</p>
        <pre v-else>{{ output }}</pre>
    </div>
</template>

<style scoped>
.llama-demo { display: grid; gap: 0.5rem; margin: 1.5rem 0; }
.llama-demo textarea, .llama-demo pre { box-sizing: border-box; min-height: 6rem; width: 100%; margin: 0; padding: 0.75rem; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); font-size: 0.875rem; line-height: 1.5; white-space: pre-wrap; }
.llama-demo textarea { resize: vertical; }
.llama-demo button { justify-self: start; }
.llama-demo__error { color: var(--vp-c-danger-1); font-family: var(--vp-font-family-mono); white-space: pre-wrap; }
</style>