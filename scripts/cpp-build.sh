#!/bin/bash

source ./emsdk/emsdk_env.sh
if [ ! -f "./build/build.ninja" ] 
then
    cmake -S . -B ./build --preset vcpkg-emscripten-MinSizeRel
fi
# cmake -S . -B ./build --preset vcpkg-emscripten-RelWithDebInfo

cmake --build ./build --parallel
