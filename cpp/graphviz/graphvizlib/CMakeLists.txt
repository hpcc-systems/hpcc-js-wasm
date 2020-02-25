PROJECT(graphvizlib)

SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s WASM=1 -s NO_FILESYSTEM=0 -s INVOKE_RUN=0 -s ENVIRONMENT=web -s ALLOW_MEMORY_GROWTH=1")
SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s MODULARIZE=1 -s EXPORT_NAME='${CMAKE_PROJECT_NAME}'")

#  Generate Glue from IDL file  ---
ADD_CUSTOM_COMMAND(
    MAIN_DEPENDENCY ${CMAKE_CURRENT_SOURCE_DIR}/main.idl
    OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/main_glue.js ${CMAKE_CURRENT_BINARY_DIR}/main_glue.cpp
    COMMAND python ${CMAKE_BINARY_DIR}/../emsdk/upstream/emscripten/tools/webidl_binder.py ${CMAKE_CURRENT_SOURCE_DIR}/main.idl ${CMAKE_CURRENT_BINARY_DIR}/main_glue
)
SET_PROPERTY(SOURCE main.cpp APPEND PROPERTY OBJECT_DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/main_glue.cpp)
SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} --post-js ${CMAKE_CURRENT_BINARY_DIR}/main_glue.js")
#  ---  ---  ---

SET(SRCS
    main.cpp
)

INCLUDE_DIRECTORIES(
    ${CMAKE_CURRENT_BINARY_DIR}
    ${GRAPHVIZSRC_DIRS}/lib/gvc
    ${GRAPHVIZSRC_DIRS}/lib/common
    ${GRAPHVIZSRC_DIRS}/lib/pathplan
    ${GRAPHVIZSRC_DIRS}/lib/cgraph
    ${GRAPHVIZSRC_DIRS}/lib/cdt
    ${GRAPHVIZSRC_DIRS}/lib/sparse
)

ADD_EXECUTABLE(graphvizlib
    ${SRCS}
)

TARGET_LINK_LIBRARIES(graphvizlib
    gvc
    gvplugin_core
    gvplugin_dot_layout
    gvplugin_neato_layout
    circogen
    dotgen
    osage
    patchwork
)

INSTALL(FILES 
    ${CMAKE_CURRENT_BINARY_DIR}/graphvizlib.wasm
    DESTINATION dist
    COMPONENT runtime
)
