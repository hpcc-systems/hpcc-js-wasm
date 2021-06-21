#!/bin/bash

if [ ! -d "./emsdk" ] 
then
    git clone https://github.com/emscripten-core/emsdk.git
fi
# List of current vertsion can be found in https://github.com/emscripten-core/emsdk/blob/main/emscripten-releases-tags.txt  ---
cd ./emsdk
git fetch
git pull
./emsdk install 2.0.24-upstream
./emsdk activate 2.0.24-upstream
cd ..
