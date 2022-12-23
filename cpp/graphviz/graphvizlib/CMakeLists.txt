project(graphvizlib)

# See:  https://github.com/emscripten-core/emscripten/blob/main/src/settings.js
string(REPLACE ";" " " CPP_FLAGS "${EM_CPP_FLAGS}")

set(EM_LINK_FLAGS 
    ${EM_LINK_FLAGS}
    "-s FILESYSTEM=1"
    "-s EXPORT_NAME='${CMAKE_PROJECT_NAME}'"
    "-s EXPORTED_FUNCTIONS=\"[_free]\""
    "-s EXPORTED_RUNTIME_METHODS=\"[]\""
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

set(SRCS
    main.cpp
)

include_directories(
    ${CMAKE_CURRENT_BINARY_DIR}
    ${GRAPHVIZ_LIB_DIR}
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/cgraph++
    ${GRAPHVIZ_LIB_DIR}/common
    ${GRAPHVIZ_LIB_DIR}/gvc
    ${GRAPHVIZ_LIB_DIR}/gvc++
    ${GRAPHVIZ_LIB_DIR}/pathplan
    ${GRAPHVIZ_LIB_DIR}/sparse
)

add_executable(graphvizlib
    ${SRCS}
)

set_target_properties(graphvizlib PROPERTIES COMPILE_FLAGS "${CPP_FLAGS}")
set_target_properties(graphvizlib PROPERTIES LINK_FLAGS "${LINK_FLAGS}")

target_link_libraries(graphvizlib PRIVATE
    gvplugin_core
    gvplugin_dot_layout
    gvplugin_neato_layout
    ortho
    gvc++
)

packWasm(graphvizlib)

# add_executable(graphvizlib-web
#     ${SRCS}
# )

# set_target_properties(graphvizlib-web PROPERTIES LINK_FLAGS "${LINK_FLAGS} -s ENVIRONMENT=web")

# target_link_libraries(graphvizlib-web PRIVATE
#     gvplugin_core
#     gvplugin_dot_layout
#     gvplugin_neato_layout
#     ortho
# )

# add_executable(graphvizlib-worker
#     ${SRCS}
# )

# set_target_properties(graphvizlib-worker PROPERTIES LINK_FLAGS "${LINK_FLAGS} -s ENVIRONMENT=worker")

# target_link_libraries(graphvizlib-worker PRIVATE
#     gvplugin_core
#     gvplugin_dot_layout
#     gvplugin_neato_layout
#     ortho
# )

# add_executable(graphvizlib-node
#     ${SRCS}
# )

# set_target_properties(graphvizlib-node PROPERTIES LINK_FLAGS "${LINK_FLAGS} -s ENVIRONMENT=node")

# target_link_libraries(graphvizlib-node PRIVATE
#     gvplugin_core
#     gvplugin_dot_layout
#     gvplugin_neato_layout
#     ortho
# )
