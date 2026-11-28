#!/bin/bash

# Verify/install the Rust toolchain pieces needed to build packages/wit-bindgen.

set -e

WASM_TOOLS_VERSION="1.262.0"

if ! command -v cargo &> /dev/null; then
    echo "Rust is not installed. Please install it first:"
    echo "   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

rustup target add wasm32-unknown-unknown

if [[ "$(wasm-tools --version 2>/dev/null | awk '{print $2}')" != "$WASM_TOOLS_VERSION" ]]; then
    cargo install wasm-tools@"$WASM_TOOLS_VERSION" --locked
fi
