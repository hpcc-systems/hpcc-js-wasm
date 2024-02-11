#!/bin/bash

source ./emsdk/emsdk_env.sh
if [ ! -d "./build" ] 
then
    cmake -S . -B ./build --preset vcpkg-emscripten-MinSizeRel
fi

cmake --build ./build --parallel
