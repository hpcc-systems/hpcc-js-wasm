#!/bin/bash

VERSION=2022.08.15

if [ ! -d "./vcpkg" ] 
then
    # https://github.com/microsoft/vcpkg/releases
    git clone https://github.com/microsoft/vcpkg.git
    cd ./vcpkg
    git checkout $VERSION
    ./bootstrap-vcpkg.sh
    cd ..
fi
