import { readFile } from "fs/promises";
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const importUrl = import.meta.url;
const __filename = fileURLToPath(importUrl);
export const scriptDir = dirname(__filename);

export async function doFetch(wasmUrl: string): Promise<ArrayBuffer> {
    return readFile(wasmUrl);
}
