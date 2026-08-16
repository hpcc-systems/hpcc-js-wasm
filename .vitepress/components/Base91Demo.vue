<script setup>
import { onMounted, ref } from "vue";
import { Base91 } from "../../packages/base91/dist/index.js";

const input = ref("WebAssembly makes compact encoding available in the browser.");
const encoded = ref("");
const decoded = ref("");
const error = ref("");
const isLoading = ref(true);
let base91;

function encode() {
    if (!base91) return;
    error.value = "";
    try {
        encoded.value = base91.encode(new TextEncoder().encode(input.value));
        decoded.value = new TextDecoder().decode(base91.decode(encoded.value));
    } catch (encodeError) {
        error.value = encodeError instanceof Error ? encodeError.message : String(encodeError);
    }
}

onMounted(async () => {
    try {
        base91 = await Base91.load();
        encode();
    } catch (loadError) {
        error.value = loadError instanceof Error ? loadError.message : String(loadError);
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
    <div class="base91-demo">
        <label for="base91-input">UTF-8 input</label>
        <textarea id="base91-input" v-model="input" spellcheck="false" @input="encode" />
        <p v-if="isLoading">Loading Base91...</p>
        <p v-else-if="error" class="base91-demo__error">{{ error }}</p>
        <template v-else>
            <label for="base91-encoded">Base91 output</label>
            <textarea id="base91-encoded" :value="encoded" readonly spellcheck="false" />
            <label for="base91-decoded">Decoded round trip</label>
            <output id="base91-decoded">{{ decoded }}</output>
        </template>
    </div>
</template>

<style scoped>
.base91-demo {
    display: grid;
    gap: 0.5rem;
    margin: 1.5rem 0;
}

.base91-demo textarea,
.base91-demo output {
    box-sizing: border-box;
    min-height: 5rem;
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    background: var(--vp-c-bg-soft);
    color: var(--vp-c-text-1);
    font-family: var(--vp-font-family-mono);
    font-size: 0.875rem;
    line-height: 1.5;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}

.base91-demo textarea {
    resize: vertical;
}

.base91-demo__error {
    color: var(--vp-c-danger-1);
    font-family: var(--vp-font-family-mono);
    white-space: pre-wrap;
}
</style>