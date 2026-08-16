<script setup>
import { onBeforeUnmount, ref } from "vue";
import { NeuralAmpModelerCore } from "../../packages/nam-core/dist/index.js";

const output = ref("");
const error = ref("");
const isLoading = ref(false);
let model;

async function selectModel(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    isLoading.value = true;
    error.value = "";
    model?.delete();
    try {
        const nam = await NeuralAmpModelerCore.load();
        model = nam.loadModel(new Uint8Array(await file.arrayBuffer()));
        const sampleRate = model.expectedSampleRate() || 48000;
        model.reset(sampleRate, 256);
        const input = new Float32Array(256 * model.inputChannels());
        const result = model.process(input, 256);
        output.value = `${file.name}\n${model.inputChannels()} input channel(s), ${model.outputChannels()} output channel(s)\n${result.length} samples processed at ${sampleRate} Hz`;
    } catch (loadError) {
        output.value = "";
        error.value = loadError instanceof Error ? loadError.message : String(loadError);
    } finally {
        isLoading.value = false;
    }
}

onBeforeUnmount(() => model?.delete());
</script>

<template>
    <div class="nam-demo">
        <label for="nam-model">Local NAM model</label>
        <input id="nam-model" type="file" accept=".nam,.json" :disabled="isLoading" @change="selectModel" />
        <p v-if="isLoading">Loading model...</p>
        <p v-else-if="error" class="nam-demo__error">{{ error }}</p>
        <pre v-else>{{ output }}</pre>
    </div>
</template>

<style scoped>
.nam-demo { display: grid; gap: 0.5rem; margin: 1.5rem 0; }
.nam-demo pre { box-sizing: border-box; min-height: 5rem; width: 100%; margin: 0; padding: 0.75rem; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); font-size: 0.875rem; line-height: 1.5; white-space: pre-wrap; }
.nam-demo__error { color: var(--vp-c-danger-1); font-family: var(--vp-font-family-mono); white-space: pre-wrap; }
</style>