project(namcorelib)

find_package(NeuralAmpModelerCore CONFIG REQUIRED)

# See:  https://github.com/emscripten-core/emscripten/blob/main/src/settings.js
set(EM_CPP_FLAGS
    ${EM_CPP_FLAGS}
    "-fwasm-exceptions"
)
string(REPLACE ";" " " CPP_FLAGS "${EM_CPP_FLAGS}")

set(EM_LINK_FLAGS
    ${EM_LINK_FLAGS}
    "-sEXPORT_NAME='${CMAKE_PROJECT_NAME}'"
    "-sEXPORTED_RUNTIME_METHODS=['UTF8ToString','lengthBytesUTF8','stringToUTF8','HEAPU8','HEAPF64']"

    "-fwasm-exceptions"
    "-sEXCEPTION_STACK_TRACES=1"
    "--emit-tsd ${CMAKE_CURRENT_BINARY_DIR}/namcorelib.d.ts"
)
string(REPLACE ";" " " LINK_FLAGS "${EM_LINK_FLAGS}")

include_directories(
    ${VCPKG_INCLUDE_DIR}
)

add_executable(namcorelib
    src-cpp/main.cpp
)

set_target_properties(namcorelib PROPERTIES COMPILE_FLAGS "${CPP_FLAGS}")
set_target_properties(namcorelib PROPERTIES LINK_FLAGS "${LINK_FLAGS}")

target_link_libraries(namcorelib
    "-Wl,--whole-archive"
    NeuralAmpModelerCore::NeuralAmpModelerCore
    "-Wl,--no-whole-archive"
)

# Copy generated files to source directories
add_custom_command(TARGET namcorelib POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy
        ${CMAKE_CURRENT_BINARY_DIR}/namcorelib.d.ts
        ${CMAKE_CURRENT_SOURCE_DIR}/types/namcorelib.d.ts
    COMMENT "Copying generated namcorelib files to source directories"
)