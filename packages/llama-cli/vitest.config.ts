import { defineConfig } from "vitest/config";
import { node } from "../../vitest-projects.ts";

const llamaCliNode = {
    ...node,
    test: {
        ...node.test,
        env: {
            NODE_TLS_REJECT_UNAUTHORIZED: "0"
        }
    }
};

export default defineConfig({
    test: llamaCliNode.test
});
