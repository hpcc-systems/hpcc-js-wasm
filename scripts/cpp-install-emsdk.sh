#!/bin/bash

if [ ! -d "./emsdk" ] 
then
    git clone https://github.com/emscripten-core/emsdk.git
fi
# List of current vertsion can be found in https://github.com/emscripten-core/emsdk/tags  ---
cd ./emsdk
git fetch
git pull
./emsdk install 3.1.13-upstream
./emsdk activate 3.1.13-upstream
cd ..
