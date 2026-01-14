project(base91lib)

find_package(unofficial-base91 CONFIG REQUIRED)

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
    "--emit-tsd ${CMAKE_CURRENT_BINARY_DIR}/base91lib.d.ts"
)
string(REPLACE ";" " " LINK_FLAGS "${EM_LINK_FLAGS}")

include_directories(
    ${VCPKG_INCLUDE_DIR}
)

add_executable(base91lib
    src-cpp/main.cpp
)

set_target_properties(base91lib PROPERTIES COMPILE_FLAGS "${CPP_FLAGS}")
set_target_properties(base91lib PROPERTIES LINK_FLAGS "${LINK_FLAGS}")

target_link_libraries(base91lib
    unofficial::base91::base91
)

# Copy generated files to source directories
add_custom_command(TARGET base91lib POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy
        ${CMAKE_CURRENT_BINARY_DIR}/base91lib.d.ts
        ${CMAKE_CURRENT_SOURCE_DIR}/types/base91lib.d.ts
    COMMENT "Copying generated base91lib files to source directories"
)
