project(graphvizlib)

# find and link libraries
find_path(Graphviz_INCLUDE_DIRS NAMES graphviz/gvc.h HINTS "${VCPKG_INSTALLED_DIR}" REQUIRED)

# display directories where Graphviz libraries and headers are found
message("Graphviz libraries: ${graphviz_LIBRARIES}")
message("Graphviz include directories: ${Graphviz_INCLUDE_DIRS}")

find_package(expat CONFIG REQUIRED)

# See:  https://github.com/emscripten-core/emscripten/blob/main/src/settings.js
string(REPLACE ";" " " CPP_FLAGS "${EM_CPP_FLAGS}")

set(EM_LINK_FLAGS 
    ${EM_LINK_FLAGS}
    "-sFILESYSTEM=1"
    "-sEXPORT_NAME='${CMAKE_PROJECT_NAME}'"
    "-sEXPORTED_FUNCTIONS=\"['_free', '_malloc']\""
    "-sEXPORTED_RUNTIME_METHODS=\"[UTF8ToString]\""
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
    main.hpp
    main.cpp
    util.hpp
    util.cpp
)

include_directories(
    ${Graphviz_INCLUDE_DIRS}/graphviz
    ${CMAKE_CURRENT_BINARY_DIR}
)

add_executable(graphvizlib
    ${SRCS}
)

set_target_properties(graphvizlib PROPERTIES COMPILE_FLAGS "${CPP_FLAGS}")
set_target_properties(graphvizlib PROPERTIES LINK_FLAGS "${LINK_FLAGS}")

# link libraries
function(add_graphviz_library library)
    find_library(GRAPHVIZ_${library} NAMES ${library})
    if(GRAPHVIZ_${library})
        target_link_libraries(graphvizlib PRIVATE ${GRAPHVIZ_${library}})
    else()
        message(FATAL_ERROR "Could not find library ${library}!")
    endif()
endfunction()

# common gvplugin_core gvplugin_dot_layout gvplugin_neato_layout ortho gvc cdt cgraph dotgen neatogen fdpgen sfdpgen twopigen circogen label osage patchwork pack sparse pathplan xdot
add_graphviz_library(common)
add_graphviz_library(gvc)
add_graphviz_library(gvplugin_core)
add_graphviz_library(gvplugin_dot_layout)
add_graphviz_library(gvplugin_neato_layout)
add_graphviz_library(ortho)
add_graphviz_library(cdt)
add_graphviz_library(cgraph)
add_graphviz_library(dotgen)
add_graphviz_library(neatogen)
add_graphviz_library(fdpgen)
add_graphviz_library(sfdpgen)
add_graphviz_library(twopigen)
add_graphviz_library(circogen)
add_graphviz_library(label)
add_graphviz_library(osage)
add_graphviz_library(patchwork)
add_graphviz_library(pack)
add_graphviz_library(sparse)
add_graphviz_library(pathplan)
add_graphviz_library(xdot)
add_graphviz_library(vpsc)

target_link_libraries(graphvizlib PRIVATE
    ${EXPAT_LIBRARIES}
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
