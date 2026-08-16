<script setup>
import { onMounted, ref } from "vue";
import { DuckDB } from "../../packages/duckdb/dist/index.js";

const sql = ref("SELECT category, sum(amount) AS total\nFROM (VALUES ('Books', 24), ('Books', 16), ('Music', 12)) AS sales(category, amount)\nGROUP BY category\nORDER BY total DESC;");
const output = ref("");
const error = ref("");
const isLoading = ref(true);
const isRunning = ref(false);
let duckdb;

function run() {
    if (!duckdb) return;
    isRunning.value = true;
    error.value = "";
    try {
        const connection = duckdb.connect();
        try {
            output.value = JSON.stringify(JSON.parse(connection.queryToJSON(sql.value)), null, 2);
        } finally {
            connection.delete();
        }
    } catch (queryError) {
        output.value = "";
        error.value = queryError instanceof Error ? queryError.message : String(queryError);
    } finally {
        isRunning.value = false;
    }
}

onMounted(async () => {
    try {
        duckdb = await DuckDB.load();
        run();
    } catch (loadError) {
        error.value = loadError instanceof Error ? loadError.message : String(loadError);
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
    <div class="duckdb-demo">
        <label for="duckdb-sql">SQL query</label>
        <textarea id="duckdb-sql" v-model="sql" spellcheck="false" />
        <button type="button" :disabled="isLoading || isRunning" @click="run">
            {{ isLoading ? "Loading DuckDB..." : isRunning ? "Running..." : "Run query" }}
        </button>
        <p v-if="error" class="duckdb-demo__error">{{ error }}</p>
        <pre v-else-if="output">{{ output }}</pre>
    </div>
</template>

<style scoped>
.duckdb-demo { display: grid; gap: 0.5rem; margin: 1.5rem 0; }
.duckdb-demo textarea, .duckdb-demo pre { box-sizing: border-box; min-height: 9rem; width: 100%; margin: 0; padding: 0.75rem; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); font-size: 0.875rem; line-height: 1.5; }
.duckdb-demo textarea { resize: vertical; }
.duckdb-demo button { justify-self: start; }
.duckdb-demo__error { color: var(--vp-c-danger-1); font-family: var(--vp-font-family-mono); white-space: pre-wrap; }
</style>