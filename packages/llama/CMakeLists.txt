project(llamalib)

find_package(Llama CONFIG REQUIRED)

# See:  https://github.com/emscripten-core/emscripten/blob/main/src/settings.js

set(EM_CPP_FLAGS 
    ${EM_CPP_FLAGS}

    "-fwasm-exceptions"
)
string(REPLACE ";" " " CPP_FLAGS "${EM_CPP_FLAGS}")

set(EM_LINK_FLAGS 
    ${EM_LINK_FLAGS}
    "-sEXPORT_NAME='${CMAKE_PROJECT_NAME}'"
    "-sFILESYSTEM=1"
    "-sFORCE_FILESYSTEM=1"
    "-sWASMFS=1"
    # "-sALLOW_UNIMPLEMENTED_SYSCALLS=1"
    #  "-pthread" 
    #  "-sPROXY_TO_PTHREAD"

    "-fwasm-exceptions"
    "--emit-tsd ${CMAKE_CURRENT_BINARY_DIR}/llamalib.d.ts"
)
string(REPLACE ";" " " LINK_FLAGS "${EM_LINK_FLAGS}")

include_directories(
    ${VCPKG_INCLUDE_DIR}
    ${CMAKE_CURRENT_BINARY_DIR}
    ${Llama_DIR}/common
)

add_executable(llamalib
    src-cpp/embedding.cpp
    src-cpp/log_wasm.cpp
    src-cpp/util.cpp
    src-cpp/stubs.c
    ${Llama_DIR}/common/common.cpp
    ${Llama_DIR}/common/sampling.cpp
)

set_target_properties(llamalib PROPERTIES COMPILE_FLAGS "${CPP_FLAGS}")
set_target_properties(llamalib PROPERTIES LINK_FLAGS "${LINK_FLAGS}")

target_link_libraries(llamalib
    PRIVATE llama
    PRIVATE ggml::ggml-cpu
)
