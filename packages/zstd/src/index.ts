// @ts-expect-error importing from a wasm file is resolved via a custom esbuild plugin
import load, { reset } from "../../../build/packages/zstd/zstdlib.wasm";
import type { MainModule } from "../types/zstdlib.js";
import { bindZstdModule, Zstd } from "./zstd.ts";

bindZstdModule(
    () => load() as Promise<MainModule>,
    reset
);

export { Zstd };
export type { ZstdLoadOptions } from "./zstd.ts";
