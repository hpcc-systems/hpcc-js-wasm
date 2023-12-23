FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update
RUN apt-get upgrade -y

RUN apt-get install -y build-essential 
RUN apt-get install -y git cmake ninja-build wget zip
RUN apt-get install -y gcc-multilib g++-multilib pkg-config autoconf bison libtool flex
RUN apt-get install -y python3 python3-pip

# Install pre-requisites (keep synced with README.md)
## NodeJS
RUN apt-get install -y ca-certificates curl gnupg
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
ENV NODE_MAJOR=18
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update
RUN apt-get install -y nodejs

# Set the working directory
WORKDIR /usr/src-ts/app

COPY ./*.* .
RUN npm ci

COPY ./scripts ./scripts
COPY ./vcpkg-overlays ./vcpkg-overlays
RUN npm run install-build-deps

COPY ./src-cpp ./src-cpp
COPY ./src-ts ./src-ts
COPY ./utils ./utils
RUN npm run build

CMD ["npm", "run", "test-node"]
