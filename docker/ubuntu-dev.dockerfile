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
ENV NODE_MAJOR=20
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update
RUN apt-get install -y nodejs

# Set the working directory
WORKDIR /usr/src-ts/app

COPY ./scripts ./scripts
RUN ./scripts/cpp-install-emsdk.sh

COPY ./vcpkg-overlays ./vcpkg-overlays
COPY ./vcpkg-configuration.json ./vcpkg-configuration.json
COPY ./vcpkg.json ./vcpkg.json
RUN ./scripts/cpp-install-vcpkg.sh

COPY ./package*.json .
COPY ./packages ./packages
COPY ./utils ./utils
RUN npm ci
RUN npm run install-playright-with-deps

COPY ./src-cpp ./src-cpp
COPY ./CMake* .
COPY ./vcpkg* .
COPY ./lerna* .
COPY ./vitest* .

ENTRYPOINT ["/bin/bash", "--login", "-c"]

CMD ["/bin/bash"]

# CMD ["npm", "run", "test-node"]
