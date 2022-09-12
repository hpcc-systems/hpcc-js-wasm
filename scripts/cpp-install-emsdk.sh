#!/bin/bash

VERSION=3.1.20

if [ ! -d "./emsdk" ] 
then
    git clone https://github.com/emscripten-core/emsdk.git
fi
# List of current vertsion can be found in https://github.com/emscripten-core/emsdk/tags  ---
cd ./emsdk
git fetch
git pull
./emsdk install $VERSION-upstream
./emsdk activate $VERSION-upstream
cd ..
