import { defineConfig } from 'vitest/config';
import { browser, node } from "../../vitest-projects.ts";

// The "test" test fetches a model from huggingface.co which may fail in
// environments with SSL inspection (UNABLE_TO_GET_ISSUER_CERT_LOCALLY).
const llamaNode = {
    ...node,
    test: {
        ...node.test,
        env: {
            NODE_TLS_REJECT_UNAUTHORIZED: "0"
        }
    }
};

export default defineConfig({
    test: {
        projects: [
            browser,
            llamaNode
        ]
    }
});