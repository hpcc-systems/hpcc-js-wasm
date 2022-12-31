FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update
RUN apt-get upgrade -y

# Install pre-requisites (keep synced with README.md)
## NodeJS
RUN apt-get install -y curl
RUN curl --silent --location https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get update
RUN apt-get install -y nodejs

## Other
RUN apt-get install -y build-essential
RUN apt-get install -y git cmake wget zip
RUN apt-get install -y gcc-multilib g++-multilib pkg-config autoconf bison libtool flex
RUN apt-get install -y python3 python3-pip

# Set the working directory
WORKDIR /usr/src-ts/app

COPY ./cpp ./cpp
COPY ./src ./src
COPY ./utils ./utils
COPY ./*.* .

RUN npm ci

COPY ./scripts ./scripts
RUN ./scripts/cpp-install-emsdk.sh

COPY ./vcpkg-overlays ./vcpkg-overlays
COPY ./vcpkg.json ./vcpkg.json
RUN ./scripts/cpp-install-vcpkg.sh
RUN ./vcpkg/bootstrap-vcpkg.sh
RUN ./vcpkg/vcpkg install --overlay-ports=./vcpkg-overlays

RUN ./scripts/cpp-install-graphviz.sh

RUN npm run build

ENTRYPOINT ["npm", "run", "build"]
