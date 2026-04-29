#!/bin/bash

# List of current version can be found in https://github.com/emscripten-core/emsdk/tags  ---
# UPDATE README.md
VERSION=5.0.5

if [ ! -d "./emsdk" ] 
then
    git clone https://github.com/emscripten-core/emsdk.git
fi
cd ./emsdk
git fetch
git pull
./emsdk install $VERSION-upstream
./emsdk activate $VERSION-upstream
cd ..

(
    cd ./emsdk/upstream/emscripten
    npm install --include=dev
)
