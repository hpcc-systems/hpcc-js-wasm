#!/bin/bash

if [ ! -d "./vcpkg" ] 
then
    git clone https://github.com/microsoft/vcpkg.git
    cd ./vcpkg
    git checkout 2022.05.10
    ./bootstrap-vcpkg.sh
    cd ..
fi
