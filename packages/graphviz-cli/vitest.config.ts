import { defineConfig } from "vitest/config";
import { node } from "../../vitest-projects.ts";

export default defineConfig({
    test: node.test
});