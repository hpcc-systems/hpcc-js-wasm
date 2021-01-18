add_library(label STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/label/index.c
    ${GRAPHVIZ_LIB_DIR}/label/node.c
    ${GRAPHVIZ_LIB_DIR}/label/rectangle.c
    ${GRAPHVIZ_LIB_DIR}/label/split.q.c
    ${GRAPHVIZ_LIB_DIR}/label/xlabels.c
)

include_directories(
    ${GRAPHVIZ_LIB_DIR}
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
)

