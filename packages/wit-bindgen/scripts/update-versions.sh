#!/bin/bash

# Syncs the pinned tool versions with the crate versions in src-rs/Cargo.toml:
#  - wasm-tools CLI (1.X.0) matches the wit-component crate (0.X)
#  - rs-install.sh and the root README.md list the wasm-tools / wit-bindgen versions

set -e
export PATH="$HOME/.cargo/bin:$PATH"

PKG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_DIR="$(cd "$PKG_DIR/../.." && pwd)"
CARGO_TOML="$PKG_DIR/src-rs/Cargo.toml"
INSTALL_SCRIPT="$ROOT_DIR/scripts/rs-install.sh"
README="$ROOT_DIR/README.md"

crate_version() {
    grep -E "^$1\s*=" "$CARGO_TOML" | head -n 1 | sed -E 's/.*version\s*=\s*"([^"]+)".*|.*=\s*"([^"]+)".*/\1\2/'
}

WIT_COMPONENT_VERSION=$(crate_version wit-component)
WIT_BINDGEN_VERSION=$(crate_version wit-bindgen-core)
if [ -z "$WIT_COMPONENT_VERSION" ] || [ -z "$WIT_BINDGEN_VERSION" ]; then
    echo "Could not find wit-component / wit-bindgen-core versions in $CARGO_TOML"
    exit 1
fi

WASM_TOOLS_VERSION="1.${WIT_COMPONENT_VERSION#0.}.0"
echo "wit-component $WIT_COMPONENT_VERSION -> wasm-tools $WASM_TOOLS_VERSION, wit-bindgen $WIT_BINDGEN_VERSION"

perl -i -pe "s/^WASM_TOOLS_VERSION=\"[^\"]*\"/WASM_TOOLS_VERSION=\"$WASM_TOOLS_VERSION\"/" "$INSTALL_SCRIPT"
perl -i -pe "s{(\\[wasm-tools\\]\\([^)]*\\) - v)[0-9.]+}{\${1}$WASM_TOOLS_VERSION}; s{(\\[wit-bindgen\\]\\([^)]*\\) - v)[0-9.]+}{\${1}$WIT_BINDGEN_VERSION}" "$README"

"$INSTALL_SCRIPT"
