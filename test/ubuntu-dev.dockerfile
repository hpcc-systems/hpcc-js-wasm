FROM ubuntu:18.04

RUN apt-get update
RUN apt-get upgrade -y

# Install pre-requisites (keep synced with README.md)
## NodeJS
RUN apt-get install -y curl
RUN curl --silent --location https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install -y build-essential

## Other
RUN apt-get install -y git cmake wget
RUN apt-get install -y gcc-multilib g++-multilib pkg-config autoconf bison libtool flex zlib1g-dev 
RUN apt-get install -y python2.7 python-pip

# Set the working directory
WORKDIR /usr/src/app

COPY ./scripts/* ./scripts/
RUN ./scripts/cpp-install-emsdk.sh
RUN ./scripts/cpp-install-graphviz.sh
RUN ./scripts/cpp-install-expat.sh

COPY . .

RUN npm ci
RUN npm run build
