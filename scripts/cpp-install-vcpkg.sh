#!/bin/bash
set -euo pipefail

# List of current version can be found in https://github.com/microsoft/vcpkg/releases  ---
# UPDATE README.md
VCPKG_BUILD_TOOLS_VERSION=2026.10.16
VCPKG_BOOTSTRAP_ATTEMPTS=3

if [ ! -d "./vcpkg" ]
then
    git clone --branch "$VCPKG_BUILD_TOOLS_VERSION" --depth 1 https://github.com/microsoft/vcpkg.git
fi
cd ./vcpkg
git checkout "$VCPKG_BUILD_TOOLS_VERSION"

bootstrap_succeeded=false
for ((attempt = 1; attempt <= VCPKG_BOOTSTRAP_ATTEMPTS; attempt++)); do
    if ./bootstrap-vcpkg.sh; then
        bootstrap_succeeded=true
        break
    fi

    if [ "$attempt" -lt "$VCPKG_BOOTSTRAP_ATTEMPTS" ]; then
        delay=$((attempt * 10))
        echo "vcpkg bootstrap failed (attempt $attempt/$VCPKG_BOOTSTRAP_ATTEMPTS); retrying in ${delay}s." >&2
        sleep "$delay"
    fi
done

if [ "$bootstrap_succeeded" = false ]; then
    echo "vcpkg bootstrap failed after $VCPKG_BOOTSTRAP_ATTEMPTS attempts." >&2
    exit 1
fi

cd ..
# source ./emsdk/emsdk_env.sh
# ./vcpkg/vcpkg install --triplet=wasm32-emscripten --x-abi-tools-use-exact-versions --downloads-root=./build/vcpkg_downloads --x-buildtrees-root=./build/vcpkg_buildtrees --x-packages-root=./build/vcpkg_packages --x-install-root=./build/vcpkg_installed
