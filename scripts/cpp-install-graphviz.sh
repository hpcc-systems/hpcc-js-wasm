#!/bin/bash

if [ ! -d "src-graphviz" ] 
then
    wget -c https://gitlab.com/graphviz/graphviz/-/archive/2.44.1/graphviz-2.44.1.tar.gz
    mkdir ./src-graphviz
    tar -xzf ./graphviz-2.44.1.tar.gz -C ./src-graphviz --strip-components=1
    rm ./graphviz-2.44.1.tar.gz

    #  Configure  ---
    cd ./src-graphviz
    ./autogen.sh
    ./configure

    #  Generate grammar files (and others)  ---
    mkdir ./build
    cd ./build
    cmake ..
    cmake --build . -- -j7
    cd ..

    cd ..
fi
