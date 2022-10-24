#!/bin/bash

# List of current vertsion can be found in https://gitlab.com/graphviz/graphviz/-/tags  ---
# UPDATE README.md
VERSION=7.0.0

if [ ! -d "src-graphviz" ] 
then
    wget -c https://gitlab.com/graphviz/graphviz/-/archive/$VERSION/graphviz-$VERSION.tar.gz
    mkdir ./src-graphviz
    tar -xzf ./graphviz-$VERSION.tar.gz -C ./src-graphviz --strip-components=1
    rm ./graphviz-$VERSION.tar.gz

    #  Generate grammar files (and others)  ---
    cd ./src-graphviz
    mkdir ./build
    cd ./build
    cmake ..
    cmake --build . -- -j -k #  see https://gitlab.com/graphviz/graphviz/-/issues/2098
    cd ..
    cd ..
fi
