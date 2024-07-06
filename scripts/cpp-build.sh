#!/bin/bash

source ./emsdk/emsdk_env.sh
if [ ! -d "./build" ]; then
    if [ "$NPM_MODE" = "Debug" ]; then
        cmake -S . -B ./build --preset vcpkg-emscripten-RelWithDebInfo
    else
        cmake -S . -B ./build --preset vcpkg-emscripten-MinSizeRel
    fi
fi

cmake --build ./build --parallel
