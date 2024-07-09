project(llamalib)

set(CMAKE_CXX_STANDARD 17)

find_package(Llama CONFIG REQUIRED)

# See:  https://github.com/emscripten-core/emscripten/blob/main/src/settings.js
string(REPLACE ";" " " CPP_FLAGS "${EM_CPP_FLAGS}")

set(EM_LINK_FLAGS 
    ${EM_LINK_FLAGS}
    "-sFILESYSTEM=1"
    "-sEXPORT_NAME='${CMAKE_PROJECT_NAME}'"
    "-sEXPORTED_FUNCTIONS=\"['_free', '_malloc']\""
    "-sEXPORTED_RUNTIME_METHODS=\"[UTF8ToString]\""
    "--post-js ${CMAKE_CURRENT_BINARY_DIR}/main_glue.js"

)
string(REPLACE ";" " " LINK_FLAGS "${EM_LINK_FLAGS}")

#  Generate Glue from IDL file  ---
add_custom_command(
    MAIN_DEPENDENCY ${CMAKE_CURRENT_SOURCE_DIR}/main.idl
    OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/main_glue.js ${CMAKE_CURRENT_BINARY_DIR}/main_glue.cpp
    COMMAND python3 ${CMAKE_BINARY_DIR}/../emsdk/upstream/emscripten/tools/webidl_binder.py ${CMAKE_CURRENT_SOURCE_DIR}/main.idl ${CMAKE_CURRENT_BINARY_DIR}/main_glue
)
set_property(SOURCE main.cpp APPEND PROPERTY OBJECT_DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/main_glue.cpp)
#  ---  ---  ---

include_directories(
    ${VCPKG_INCLUDE_DIR}
    ${CMAKE_CURRENT_BINARY_DIR}
    ${Llama_DIR}/common
)

add_executable(llamalib
    main.cpp
    ${Llama_DIR}/common/common.cpp
    ${Llama_DIR}/common/sampling.cpp
    ${Llama_DIR}/common/console.cpp
    ${Llama_DIR}/common/grammar-parser.cpp
    ${Llama_DIR}/common/json-schema-to-grammar.cpp
    ${Llama_DIR}/common/build-info.cpp
)

set_target_properties(llamalib PROPERTIES COMPILE_FLAGS "${CPP_FLAGS}")
set_target_properties(llamalib PROPERTIES LINK_FLAGS "${LINK_FLAGS}")

target_link_libraries(llamalib
    PRIVATE llama 
    ${Llama_DIR}/../../lib/libggml.a
)

packWasm(llamalib)
