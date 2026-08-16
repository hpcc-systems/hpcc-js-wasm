<script setup>
import { onMounted, ref } from "vue";
import { Zstd } from "../../packages/zstd/dist/index.js";

const input = ref("Zstandard compresses repeated text. ".repeat(12));
const output = ref("");
const error = ref("");
const isLoading = ref(true);
let zstd;

function compress() {
    if (!zstd) return;
    error.value = "";
    try {
        const bytes = new TextEncoder().encode(input.value);
        const compressed = zstd.compress(bytes);
        const restored = new TextDecoder().decode(zstd.decompress(compressed));
        output.value = `${bytes.length} bytes -> ${compressed.length} bytes\n\nRound trip: ${restored}`;
    } catch (compressionError) {
        output.value = "";
        error.value = compressionError instanceof Error ? compressionError.message : String(compressionError);
    }
}

onMounted(async () => {
    try {
        zstd = await Zstd.load();
        compress();
    } catch (loadError) {
        error.value = loadError instanceof Error ? loadError.message : String(loadError);
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
    <div class="zstd-demo">
        <label for="zstd-input">Text to compress</label>
        <textarea id="zstd-input" v-model="input" spellcheck="false" />
        <button type="button" :disabled="isLoading" @click="compress">{{ isLoading ? "Loading Zstd..." : "Compress" }}</button>
        <p v-if="error" class="zstd-demo__error">{{ error }}</p>
        <pre v-else>{{ output }}</pre>
    </div>
</template>

<style scoped>
.zstd-demo { display: grid; gap: 0.5rem; margin: 1.5rem 0; }
.zstd-demo textarea, .zstd-demo pre { box-sizing: border-box; min-height: 7rem; width: 100%; margin: 0; padding: 0.75rem; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); font-size: 0.875rem; line-height: 1.5; white-space: pre-wrap; }
.zstd-demo textarea { resize: vertical; }
.zstd-demo button { justify-self: start; }
.zstd-demo__error { color: var(--vp-c-danger-1); font-family: var(--vp-font-family-mono); white-space: pre-wrap; }
</style>