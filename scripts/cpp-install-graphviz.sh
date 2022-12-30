#!/bin/bash

# List of current vertsion can be found in https://gitlab.com/graphviz/graphviz/-/tags  ---
# UPDATE README.md
VERSION=7.0.5

if [ ! -d "third-party/graphviz" ] 
then
    wget -c https://gitlab.com/graphviz/graphviz/-/archive/$VERSION/graphviz-$VERSION.tar.gz
    mkdir -p ./third-party/graphviz
    tar -xzf ./graphviz-$VERSION.tar.gz -C ./third-party/graphviz --strip-components=1
    rm ./graphviz-$VERSION.tar.gz

    #  Generate grammar files (and others)  ---
    cd ./third-party/graphviz
    mkdir ./build
    cd ./build
    cmake .. -Dwith_gvedit=OFF
    cmake --build . -- -j -k #  see https://gitlab.com/graphviz/graphviz/-/issues/2098
    cd ..
    cd ..
fi
