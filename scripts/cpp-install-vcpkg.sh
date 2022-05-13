#!/bin/bash

if [ ! -d "./vcpkg" ] 
then
    # https://github.com/microsoft/vcpkg/releases
    git clone https://github.com/microsoft/vcpkg.git
    cd ./vcpkg
    git checkout 2022.06.16.1
    ./bootstrap-vcpkg.sh
    cd ..
fi
