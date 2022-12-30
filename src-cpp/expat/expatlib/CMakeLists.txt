project(expatlib)

find_package(expat CONFIG REQUIRED)

# See:  https://github.com/emscripten-core/emscripten/blob/main/src/settings.js
string(REPLACE ";" " " CPP_FLAGS "${EM_CPP_FLAGS}")

set(EM_LINK_FLAGS 
    ${EM_LINK_FLAGS}
    "-sEXPORT_NAME='${CMAKE_PROJECT_NAME}'"
    "-sEXPORTED_FUNCTIONS=\"['_malloc']\""
    "-sEXPORTED_RUNTIME_METHODS=\"[]\""
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
)

add_executable(expatlib
    main.cpp
)

set_target_properties(base91lib PROPERTIES COMPILE_FLAGS "${CPP_FLAGS}")
set_target_properties(expatlib PROPERTIES LINK_FLAGS "${LINK_FLAGS}")

target_link_libraries(expatlib
    expat::expat
)

packWasm(expatlib)
