#!/bin/bash

# Build the wit-bindgen Rust crate into a WebAssembly component and transpile it to JS.
# Tools: cargo (Rust), wasm-tools (component model), jco (JS transpilation)
# Usage: build-rs.sh [--dev]

set -e

export PATH="$HOME/.cargo/bin:$PATH"

PKG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RS_DIR="$PKG_DIR/src-rs"
OUT_DIR="$PKG_DIR/../../build/packages/wit-bindgen"
mkdir -p "$OUT_DIR"
OUT_DIR="$(cd "$OUT_DIR" && pwd)"

CARGO_FLAGS="--release"
CARGO_PROFILE="release"
if [[ "$1" == "--dev" ]]; then
    CARGO_FLAGS=""
    CARGO_PROFILE="debug"
fi

cd "$RS_DIR"
cargo build --target wasm32-unknown-unknown $CARGO_FLAGS

CORE_WASM="$RS_DIR/target/wasm32-unknown-unknown/$CARGO_PROFILE/wit_bindgen_wasm.wasm"
EMBEDDED_WASM="$RS_DIR/target/wit_bindgen_wasm.embedded.wasm"
COMPONENT_WASM="$RS_DIR/target/wit_bindgen_wasm.component.wasm"

wasm-tools component embed wit/ "$CORE_WASM" --world wit-bindgen-wasm -o "$EMBEDDED_WASM"
wasm-tools component new "$EMBEDDED_WASM" -o "$COMPONENT_WASM"

# The core wasm is inlined as base64 (cutoff larger than any module) so the bundle is self-contained.
rm -rf "$OUT_DIR"/*
npx jco transpile "$COMPONENT_WASM" -o "$OUT_DIR" --name wit_bindgen_wasm --base64-cutoff 1000000000 --quiet

echo "wit-bindgen component: $OUT_DIR"
