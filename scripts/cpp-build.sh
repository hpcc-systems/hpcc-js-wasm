#!/bin/bash

source ./emsdk/emsdk_env.sh
if [ ! -d "./build" ] 
then
    mkdir -p build
    cmake -S . -B ./build -DCMAKE_BUILD_TYPE=MinSizeRel
fi

mkdir -p ./lib-esm
cd ./build
cmake --build . -- -j
cd ..
