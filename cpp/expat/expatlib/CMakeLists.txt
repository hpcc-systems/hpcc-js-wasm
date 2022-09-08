PROJECT(expatlib)

find_package(expat CONFIG REQUIRED)

# See:  https://github.com/emscripten-core/emscripten/blob/main/src/settings.js
SET(EM_FLAGS 
    ${EM_FLAGS}
    "-s EXPORT_NAME='${CMAKE_PROJECT_NAME}'"
    "-s EXPORTED_FUNCTIONS=\"['_malloc']\""
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

ADD_EXECUTABLE(expatlib
    main.cpp
)

SET_TARGET_PROPERTIES(expatlib PROPERTIES LINK_FLAGS "${LINK_FLAGS} -s ENVIRONMENT=web")

TARGET_LINK_LIBRARIES(expatlib
    expat::expat
)

ADD_EXECUTABLE(expatlib_node
    main.cpp
)

SET_TARGET_PROPERTIES(expatlib_node PROPERTIES LINK_FLAGS "${LINK_FLAGS} -s ENVIRONMENT=node")

TARGET_LINK_LIBRARIES(expatlib_node
    expat::expat
)

INSTALL(FILES ${CMAKE_CURRENT_BINARY_DIR}/expatlib.wasm DESTINATION dist COMPONENT runtime)

IF (CMAKE_BUILD_TYPE STREQUAL "Debug")
    INSTALL(FILES ${CMAKE_CURRENT_BINARY_DIR}/expatlib.wasm.map DESTINATION dist COMPONENT runtime)
ENDIF ()