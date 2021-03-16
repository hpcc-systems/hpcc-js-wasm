#!/bin/bash

if [ ! -d "src-graphviz" ] 
then
    wget -c https://gitlab.com/graphviz/graphviz/-/archive/2.47.0/graphviz-2.47.0.tar.gz
    mkdir ./src-graphviz
    tar -xzf ./graphviz-2.47.0.tar.gz -C ./src-graphviz --strip-components=1
    rm ./graphviz-2.47.0.tar.gz

    #  Configure  ---
    cd ./src-graphviz
    ./autogen.sh
    ./configure

    #  Generate grammar files (and others)  ---
    mkdir ./build
    cd ./build
    cmake ..
    cmake --build . -- -j
    cd ..

    cd ..
fi
