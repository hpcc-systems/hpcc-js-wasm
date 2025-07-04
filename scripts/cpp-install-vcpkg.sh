#!/bin/bash

# List of current version can be found in https://github.com/microsoft/vcpkg/releases  ---
# UPDATE README.md
VCPKG_BUILD_TOOLS_VERSION=2025.06.13

if [ ! -d "./vcpkg" ] 
then
    git clone https://github.com/microsoft/vcpkg.git
fi
cd ./vcpkg
git checkout $VCPKG_BUILD_TOOLS_VERSION
./bootstrap-vcpkg.sh
cd ..
source ./emsdk/emsdk_env.sh
./vcpkg/vcpkg install --overlay-ports=./vcpkg-overlays --overlay-triplets=./vcpkg-triplets --triplet=wasm32-emscripten --x-install-root=./vcpkg/vcpkg-installed_wasm
