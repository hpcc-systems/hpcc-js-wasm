CMAKE_MINIMUM_REQUIRED(VERSION 3.9.2)

PROJECT(cpp)

SET(CMAKE_INSTALL_PREFIX "..")
SET(VCPKG_INCLUDE_DIR ${VCPKG_INSTALLED_DIR}/${VCPKG_TARGET_TRIPLET}/include)

# See:  https://github.com/emscripten-core/emscripten/blob/main/src/settings.js
SET(EM_FLAGS 
    "-s ASSERTIONS=0"
    "-s INVOKE_RUN=0"
    "-s ALLOW_MEMORY_GROWTH=1"
    "-s WASM=1"
    "-s ENVIRONMENT=web"
    "-s FILESYSTEM=0"
    # "-s MINIMAL_RUNTIME=1"
    "-s MODULARIZE=1" 
    "-s EXPORT_ES6=1"
    "-s IGNORE_CLOSURE_COMPILER_ERRORS=0"
    "-s USE_ES6_IMPORT_META=0"
    # "-s WASM_BIGINT=1"
    "--pre-js ${CMAKE_CURRENT_SOURCE_DIR}/cpp/src/pre.js"
    "--post-js ${CMAKE_CURRENT_SOURCE_DIR}/cpp/src/post.js"
)

IF (CMAKE_BUILD_TYPE STREQUAL "Debug")
    SET(EM_FLAGS 
        ${EM_FLAGS}
        "-gsource-map"
        "--source-map-base ${CMAKE_CURRENT_SOURCE_DIR}"
    )
ENDIF()

SET(EMSDK_DIR "${CMAKE_SOURCE_DIR}/emsdk")
SET(EXPAT_DIR "${CMAKE_SOURCE_DIR}/src-expat/expat")
SET(GRAPHVIZ_DIR "${CMAKE_SOURCE_DIR}/src-graphviz")

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

ADD_SUBDIRECTORY(cpp)
