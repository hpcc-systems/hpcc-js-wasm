project(zstdlib)

find_package(zstd CONFIG REQUIRED)

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
    "--emit-tsd ${CMAKE_CURRENT_BINARY_DIR}/zstdlib.d.ts"
)
string(REPLACE ";" " " LINK_FLAGS "${EM_LINK_FLAGS}")

include_directories(
    ${VCPKG_INCLUDE_DIR}
)

add_executable(zstdlib
    src-cpp/main.cpp
)

set_target_properties(zstdlib PROPERTIES COMPILE_FLAGS "${CPP_FLAGS}")
set_target_properties(zstdlib PROPERTIES LINK_FLAGS "${LINK_FLAGS}")

target_link_libraries(zstdlib
    PRIVATE $<IF:$<TARGET_EXISTS:zstd::libzstd_shared>,zstd::libzstd_shared,zstd::libzstd_static>
)

# Copy generated files to source directories
add_custom_command(TARGET zstdlib POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy
        ${CMAKE_CURRENT_BINARY_DIR}/zstdlib.d.ts
        ${CMAKE_CURRENT_SOURCE_DIR}/types/zstdlib.d.ts
    COMMENT "Copying generated zstdlib files to source directories"
)
