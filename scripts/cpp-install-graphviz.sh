#!/bin/bash

if [ ! -d "src-graphviz" ] 
then
    wget -c https://gitlab.com/graphviz/graphviz/-/archive/stable_release_2.42.4/graphviz-stable_release_2.42.4.tar.gz
    mkdir ./src-graphviz
    tar -xzf ./graphviz-stable_release_2.42.4.tar.gz -C ./src-graphviz --strip-components=1
    rm ./graphviz-stable_release_2.42.4.tar.gz

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
