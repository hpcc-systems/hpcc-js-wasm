add_library(gvplugin_dot_layout STATIC
    # Source files
    ${GRAPHVIZ_PLUGIN_DIR}/dot_layout/gvplugin_dot_layout.c
    ${GRAPHVIZ_PLUGIN_DIR}/dot_layout/gvlayout_dot_layout.c
)

target_include_directories(gvplugin_dot_layout PRIVATE
    ${GRAPHVIZ_LIB_DIR}
    ${GRAPHVIZ_PLUGIN_DIR}/dot_layout
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
    ${GRAPHVIZ_LIB_DIR}/gvc
    ${GRAPHVIZ_LIB_DIR}/pathplan
)

target_link_libraries(gvplugin_dot_layout
    cdt
    cgraph
    dotgen
    gvc
    pathplan
)

