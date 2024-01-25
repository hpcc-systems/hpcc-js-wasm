#!/bin/bash

# List of current vertsion can be found in https://github.com/microsoft/vcpkg/releases  ---
# UPDATE README.md
VCPKG_BUILD_TOOLS_VERSION=2024.01.12

if [ ! -d "./vcpkg" ] 
then
    git clone https://github.com/microsoft/vcpkg.git
    cd ./vcpkg
    git checkout $VCPKG_BUILD_TOOLS_VERSION
    ./bootstrap-vcpkg.sh
    cd ..
fi

source ./emsdk/emsdk_env.sh
./vcpkg/vcpkg install --overlay-ports=./vcpkg-overlays --overlay-triplets=./vcpkg-triplets --triplet=wasm32-emscripten --x-install-root=./vcpkg/vcpkg-installed_wasm
