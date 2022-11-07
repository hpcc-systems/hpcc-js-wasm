PROJECT(zstdlib)

find_package(zstd CONFIG REQUIRED)

# See:  https://github.com/emscripten-core/emscripten/blob/main/src/settings.js
SET(EM_FLAGS 
    ${EM_FLAGS}
    "-s EXPORT_NAME='${CMAKE_PROJECT_NAME}'"
    "-s EXPORTED_FUNCTIONS=\"[]\""
    "-s EXPORTED_RUNTIME_METHODS=\"[]\""
    "--post-js ${CMAKE_CURRENT_BINARY_DIR}/main_glue.js"
)
STRING(REPLACE ";" " " LINK_FLAGS "${EM_FLAGS}")

#  Generate Glue from IDL file  ---
ADD_CUSTOM_COMMAND(
    MAIN_DEPENDENCY ${CMAKE_CURRENT_SOURCE_DIR}/main.idl
    OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/main_glue.js ${CMAKE_CURRENT_BINARY_DIR}/main_glue.cpp
    COMMAND python3 ${CMAKE_BINARY_DIR}/../emsdk/upstream/emscripten/tools/webidl_binder.py ${CMAKE_CURRENT_SOURCE_DIR}/main.idl ${CMAKE_CURRENT_BINARY_DIR}/main_glue
)
SET_PROPERTY(SOURCE main.cpp APPEND PROPERTY OBJECT_DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/main_glue.cpp)
#  ---  ---  ---

INCLUDE_DIRECTORIES(
    ${VCPKG_INCLUDE_DIR}
    ${CMAKE_CURRENT_BINARY_DIR}
)

ADD_EXECUTABLE(zstdlib
    main.cpp
)

SET_TARGET_PROPERTIES(zstdlib PROPERTIES LINK_FLAGS "${LINK_FLAGS} -s ENVIRONMENT=webview")

TARGET_LINK_LIBRARIES(zstdlib
    PRIVATE $<IF:$<TARGET_EXISTS:zstd::libzstd_shared>,zstd::libzstd_shared,zstd::libzstd_static>
)
