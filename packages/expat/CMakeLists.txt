project(expatlib)

find_package(expat CONFIG REQUIRED)

# See:  https://github.com/emscripten-core/emscripten/blob/main/src/settings.js
set(EM_CPP_FLAGS 
    ${EM_CPP_FLAGS}
    "-fwasm-exceptions"
)
string(REPLACE ";" " " CPP_FLAGS "${EM_CPP_FLAGS}")

set(EM_LINK_FLAGS 
    ${EM_LINK_FLAGS}
    "-sEXPORT_NAME='${CMAKE_PROJECT_NAME}'"

    "-fwasm-exceptions"
    "-sEXCEPTION_STACK_TRACES=1"
    "--emit-tsd ${CMAKE_CURRENT_BINARY_DIR}/expatlib.d.ts"
)
string(REPLACE ";" " " LINK_FLAGS "${EM_LINK_FLAGS}")

include_directories(
    ${VCPKG_INCLUDE_DIR}
)

add_executable(expatlib
    src-cpp/main.cpp
)

set_target_properties(expatlib PROPERTIES COMPILE_FLAGS "${CPP_FLAGS}")
set_target_properties(expatlib PROPERTIES LINK_FLAGS "${LINK_FLAGS}")

target_link_libraries(expatlib
    expat::expat
)

# Copy generated files to source directories
add_custom_command(TARGET expatlib POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy
        ${CMAKE_CURRENT_BINARY_DIR}/expatlib.d.ts
        ${CMAKE_CURRENT_SOURCE_DIR}/types/expatlib.d.ts
    COMMENT "Copying generated expatlib files to source directories"
)
