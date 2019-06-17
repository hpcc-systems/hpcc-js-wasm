#!/bin/bash
if [ ! -d "./emsdk" ] 
then
    git clone https://github.com/emscripten-core/emsdk.git
fi
cd emsdk
# Uncomment to update  ---
# git pull
./emsdk install latest
./emsdk activate latest
cd ..
