<script setup>
import { onMounted, ref } from "vue";
import { Expat } from "../../packages/expat/dist/index.js";

const xml = ref("<library><book id=\"1\">WASM in Practice</book><book id=\"2\">XML Streams</book></library>");
const output = ref([]);
const error = ref("");
const isLoading = ref(true);
let expat;

function parse() {
    if (!expat) return;
    error.value = "";
    const events = [];
    try {
        expat.parse(xml.value, {
            startElement(tag, attrs) { events.push({ event: "start", tag, attrs }); },
            endElement(tag) { events.push({ event: "end", tag }); },
            characterData(content) { if (content.trim()) events.push({ event: "text", content }); }
        });
        output.value = events;
    } catch (parseError) {
        output.value = [];
        error.value = parseError instanceof Error ? parseError.message : String(parseError);
    }
}

onMounted(async () => {
    try {
        expat = await Expat.load();
        parse();
    } catch (loadError) {
        error.value = loadError instanceof Error ? loadError.message : String(loadError);
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
    <div class="expat-demo">
        <label for="expat-xml">XML input</label>
        <textarea id="expat-xml" v-model="xml" spellcheck="false" />
        <button type="button" :disabled="isLoading" @click="parse">{{ isLoading ? "Loading Expat..." : "Parse XML" }}</button>
        <p v-if="error" class="expat-demo__error">{{ error }}</p>
        <pre v-else>{{ JSON.stringify(output, null, 2) }}</pre>
    </div>
</template>

<style scoped>
.expat-demo { display: grid; gap: 0.5rem; margin: 1.5rem 0; }
.expat-demo textarea, .expat-demo pre { box-sizing: border-box; min-height: 8rem; width: 100%; margin: 0; padding: 0.75rem; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); font-size: 0.875rem; line-height: 1.5; }
.expat-demo textarea { resize: vertical; }
.expat-demo button { justify-self: start; }
.expat-demo__error { color: var(--vp-c-danger-1); font-family: var(--vp-font-family-mono); white-space: pre-wrap; }
</style>