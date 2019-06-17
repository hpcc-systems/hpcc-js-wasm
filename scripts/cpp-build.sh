#!/bin/bash
source ./emsdk/emsdk_env.sh
if [ ! -d "./build" ] 
then
    mkdir build
    cd ./build
    cmake ../cpp -DCMAKE_TOOLCHAIN_FILE="../emsdk/fastcomp/emscripten/cmake/Modules/Platform/Emscripten.cmake" -DCMAKE_BUILD_TYPE=MinSizeRel
else
    cd ./build
fi
cmake --build . --target install -- -j7
