PROJECT(graphvizlib)

SET(EM_FLAGS "-s WASM=1 -s INVOKE_RUN=0 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=2 -s EXPORT_NAME='${CMAKE_PROJECT_NAME}' --post-js ${CMAKE_CURRENT_BINARY_DIR}/main_glue.js")

#  Generate Glue from IDL file  ---
ADD_CUSTOM_COMMAND(
    MAIN_DEPENDENCY ${CMAKE_CURRENT_SOURCE_DIR}/main.idl
    OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/main_glue.js ${CMAKE_CURRENT_BINARY_DIR}/main_glue.cpp
    COMMAND python3 ${CMAKE_BINARY_DIR}/../emsdk/upstream/emscripten/tools/webidl_binder.py ${CMAKE_CURRENT_SOURCE_DIR}/main.idl ${CMAKE_CURRENT_BINARY_DIR}/main_glue
)
SET_PROPERTY(SOURCE main.cpp APPEND PROPERTY OBJECT_DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/main_glue.cpp)
#  ---  ---  ---

SET(SRCS
    main.cpp
)

INCLUDE_DIRECTORIES(
    ${CMAKE_CURRENT_BINARY_DIR}
    ${GRAPHVIZ_LIB_DIR}
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
    ${GRAPHVIZ_LIB_DIR}/gvc
    ${GRAPHVIZ_LIB_DIR}/pathplan
    ${GRAPHVIZ_LIB_DIR}/sparse
)

ADD_EXECUTABLE(graphvizlib
    ${SRCS}
)

SET_TARGET_PROPERTIES(graphvizlib PROPERTIES LINK_FLAGS "-s ENVIRONMENT=web ${EM_FLAGS}")

TARGET_LINK_LIBRARIES(graphvizlib
    gvplugin_core
    gvplugin_dot_layout
    gvplugin_neato_layout
    common
    label
    ortho
    pack
)

ADD_EXECUTABLE(graphvizlib.node
    ${SRCS}
)

SET_TARGET_PROPERTIES(graphvizlib.node PROPERTIES LINK_FLAGS "-s ENVIRONMENT=node ${EM_FLAGS}")

TARGET_LINK_LIBRARIES(graphvizlib.node
    gvplugin_core
    gvplugin_dot_layout
    gvplugin_neato_layout
    common
    label
    ortho
    pack
)

INSTALL(FILES 
    ${CMAKE_CURRENT_BINARY_DIR}/graphvizlib.wasm
    DESTINATION dist
    COMPONENT runtime
)
