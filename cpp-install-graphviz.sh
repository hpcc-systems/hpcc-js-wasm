#!/bin/bash
if [ ! -d "graphviz-2.40.1" ] 
then
    wget -c https://graphviz.gitlab.io/pub/graphviz/stable/SOURCES/graphviz.tar.gz 
    tar -xzf ./graphviz.tar.gz
    cd ./graphviz-2.40.1
    ./configure
    cd ..
    rm ./graphviz.tar.gz
fi
