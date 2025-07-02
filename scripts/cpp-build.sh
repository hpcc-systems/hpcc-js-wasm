#!/bin/bash

source ./emsdk/emsdk_env.sh
if [ ! -d "./build" ] 
then
    cmake -S . -B ./build --preset vcpkg-emscripten-MinSizeRel
fi
# cmake -S . -B ./build --preset vcpkg-emscripten-Debug

cmake --build ./build --parallel
