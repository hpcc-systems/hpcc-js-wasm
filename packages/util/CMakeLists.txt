project(utillib)

# See:  https://github.com/emscripten-core/emscripten/blob/main/src/settings.js

set(EM_CPP_FLAGS 
    ${EM_CPP_FLAGS}

    "-fwasm-exceptions"
)
string(REPLACE ";" " " CPP_FLAGS "${EM_CPP_FLAGS}")

set(EM_LINK_FLAGS 
    ${EM_LINK_FLAGS}
    "-sEXPORT_NAME='${CMAKE_PROJECT_NAME}'"
    "-sENVIRONMENT=web,node"
    # "-sFILESYSTEM=1"
    # "-sFORCE_FILESYSTEM=1"
    # "-sWASMFS=1"
    # "-sWASM_BIGINT=1"

    "-fwasm-exceptions"
    "-sEXCEPTION_STACK_TRACES=1"
    "--emit-tsd ${CMAKE_CURRENT_BINARY_DIR}/utillib.d.ts"
)
string(REPLACE ";" " " LINK_FLAGS "${EM_LINK_FLAGS}")

set(SRCS
    src-cpp/main.cpp
)

include_directories(
    ${VCPKG_INCLUDE_DIR}
)

add_executable(utillib
    ${SRCS}
)

set_target_properties(utillib PROPERTIES COMPILE_FLAGS "${CPP_FLAGS}")
set_target_properties(utillib PROPERTIES LINK_FLAGS "${LINK_FLAGS}")

target_link_libraries(utillib

)
