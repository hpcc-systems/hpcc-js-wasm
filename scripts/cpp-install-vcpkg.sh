#!/bin/bash

# List of current vertsion can be found in https://github.com/microsoft/vcpkg/releases  ---
# ./vcpkg/packages/base91_wasm32-emscripten/CONTROL
# ./vcpkg/packages/expat/CONTROL
# ./vcpkg/packages/zstd/CONTROL
# UPDATE README.md
VERSION=2022.11.14

if [ ! -d "./vcpkg" ] 
then
    git clone https://github.com/microsoft/vcpkg.git
    cd ./vcpkg
    git checkout $VERSION
    ./bootstrap-vcpkg.sh
    cd ..
fi
