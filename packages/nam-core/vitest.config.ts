import { defineConfig } from 'vitest/config';
import { defineBrowserCommand } from '@vitest/browser';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { browser, node } from "../../vitest-projects.ts";

const neuralAmpModelerCoreBrowser = {
    ...browser,
    test: {
        ...browser.test,
        browser: {
            ...browser.test.browser,
            commands: {
                saveBinaryFile: defineBrowserCommand(async (_context, path: string, base64: string) => {
                    await mkdir(dirname(path), { recursive: true });
                    await writeFile(path, Buffer.from(base64, "base64"));
                })
            }
        }
    }
};

export default defineConfig({
    test: {
        projects: [
            neuralAmpModelerCoreBrowser,
            node
        ]
    }
});