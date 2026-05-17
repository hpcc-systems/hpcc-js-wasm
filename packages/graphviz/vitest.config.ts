import { defineConfig } from 'vitest/config';
import { browser, node } from "../../vitest-projects.ts";

export default defineConfig({
    test: {
        projects: [
            browser,
            node
        ]
    }
});