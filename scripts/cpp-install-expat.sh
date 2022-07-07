#!/bin/bash

if [ ! -d "src-expat" ] 
then
    #  https://github.com/libexpat/libexpat/tags
    wget -c https://github.com/libexpat/libexpat/archive/R_2_4_8.tar.gz
    mkdir ./src-expat
    tar -xzf ./R_2_4_8.tar.gz -C ./src-expat --strip-components=1
    rm ./R_2_4_8.tar.gz

    #  Configure  ---
    cd ./src-expat/expat
    ./buildconf.sh
    ./configure --without-xmlwf --without-docbook

    #  Generate include files (and others)  ---
    mkdir ./build
    cd ./build
    cmake ..
    cmake --build . -- -j
    cd ..

    cd ../..
fi
