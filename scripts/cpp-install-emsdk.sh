#!/bin/bash

if [ ! -d "./emsdk" ] 
then
    git clone https://github.com/emscripten-core/emsdk.git
fi
# List of current vertsion can be found in ./emsdk/emscripten-releases-tags.txt  ---
cd ./emsdk
git fetch
git pull
./emsdk install 1.39.8-upstream
./emsdk activate 1.39.8-upstream
cd ..
