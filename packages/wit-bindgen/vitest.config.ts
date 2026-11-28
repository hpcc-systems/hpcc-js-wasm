import { defineConfig } from 'vitest/config';
import { browser, node } from "../../vitest-projects.ts";

export default defineConfig({
    optimizeDeps: {
        exclude: ["@bytecodealliance/jco"]
    },
    test: {
        projects: [
            browser,
            node
        ]
    }
});
