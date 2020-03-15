INCLUDE_DIRECTORIES(
    ${GRAPHVIZ_LIB_DIR}/label
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
)

ADD_LIBRARY(label STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/label/index.c
    ${GRAPHVIZ_LIB_DIR}/label/node.c
    ${GRAPHVIZ_LIB_DIR}/label/rectangle.c
    ${GRAPHVIZ_LIB_DIR}/label/split.q.c
    ${GRAPHVIZ_LIB_DIR}/label/xlabels.c
)
    
