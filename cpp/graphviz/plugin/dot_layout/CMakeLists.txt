add_library(gvplugin_dot_layout STATIC
    # Source files
    ${GRAPHVIZSRC_DIRS}/plugin/dot_layout/gvplugin_dot_layout.c
    ${GRAPHVIZSRC_DIRS}/plugin/dot_layout/gvlayout_dot_layout.c
)

include_directories(
    ${GRAPHVIZ_LIB_DIR}
    ${GRAPHVIZSRC_DIRS}/plugin/dot_layout
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

