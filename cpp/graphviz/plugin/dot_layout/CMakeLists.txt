INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/plugin/dot_layout
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
    ${GRAPHVIZ_LIB_DIR}/gvc
    ${GRAPHVIZ_LIB_DIR}/pathplan
)

ADD_LIBRARY(gvplugin_dot_layout STATIC
    # Source files
    ${GRAPHVIZSRC_DIRS}/plugin/dot_layout/gvplugin_dot_layout.c
    ${GRAPHVIZSRC_DIRS}/plugin/dot_layout/gvlayout_dot_layout.c
)

TARGET_LINK_LIBRARIES(gvplugin_dot_layout
    cdt
    cgraph
    dotgen
    gvc
    pathplan
)

