#!/bin/bash

if [ ! -d "src-graphviz" ] 
then
    #  https://gitlab.com/graphviz/graphviz/-/tags
    wget -c https://gitlab.com/graphviz/graphviz/-/archive/2.49.1/graphviz-2.49.1.tar.gz
    mkdir ./src-graphviz
    tar -xzf ./graphviz-2.49.1.tar.gz -C ./src-graphviz --strip-components=1
    rm ./graphviz-2.49.1.tar.gz

    #  Generate grammar files (and others)  ---
    cd ./src-graphviz
    mkdir ./build
    cd ./build
    cmake ..
    cmake --build . #  -- -j (See https://gitlab.com/graphviz/graphviz/-/issues/2098)
    cd ..

    cd ..
fi
