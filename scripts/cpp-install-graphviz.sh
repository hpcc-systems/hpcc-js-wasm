#!/bin/bash

VERSION=7.0.1

if [ ! -d "src-graphviz" ] 
then
    #  https://gitlab.com/graphviz/graphviz/-/tags
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
