#!/bin/bash

# List of current version can be found in https://github.com/microsoft/vcpkg/releases  ---
# UPDATE README.md
VCPKG_BUILD_TOOLS_VERSION=2025.10.17

if [ ! -d "./vcpkg" ] 
then
    git clone https://github.com/microsoft/vcpkg.git
fi
cd ./vcpkg
git checkout $VCPKG_BUILD_TOOLS_VERSION
./bootstrap-vcpkg.sh
cd ..
source ./emsdk/emsdk_env.sh
./vcpkg/vcpkg install --triplet=wasm32-emscripten --x-abi-tools-use-exact-versions --downloads-root=./build/vcpkg_downloads --x-buildtrees-root=./build/vcpkg_buildtrees --x-packages-root=./build/vcpkg_packages --x-install-root=./build/vcpkg_installed
