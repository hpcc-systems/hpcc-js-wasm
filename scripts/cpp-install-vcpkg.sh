#!/bin/bash

# List of current vertsion can be found in https://github.com/microsoft/vcpkg/releases  ---
# UPDATE README.md
VERSION=2023.08.09

if [ ! -d "./vcpkg" ] 
then
    git clone https://github.com/microsoft/vcpkg.git
    cd ./vcpkg
    git checkout $VERSION
    ./bootstrap-vcpkg.sh
    cd ..
fi

source ./emsdk/emsdk_env.sh
./vcpkg/vcpkg install --overlay-ports=./vcpkg-overlays --overlay-triplets=./vcpkg-triplets --triplet=wasm32-emscripten --x-install-root=./vcpkg/vcpkg-installed_wasm
