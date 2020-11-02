add_library(sparse STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/sparse/BinaryHeap.c
    ${GRAPHVIZ_LIB_DIR}/sparse/clustering.c
    ${GRAPHVIZ_LIB_DIR}/sparse/color_palette.c
    ${GRAPHVIZ_LIB_DIR}/sparse/colorutil.c
    ${GRAPHVIZ_LIB_DIR}/sparse/DotIO.c
    ${GRAPHVIZ_LIB_DIR}/sparse/general.c
    ${GRAPHVIZ_LIB_DIR}/sparse/IntStack.c
    ${GRAPHVIZ_LIB_DIR}/sparse/LinkedList.c
    ${GRAPHVIZ_LIB_DIR}/sparse/mq.c
    ${GRAPHVIZ_LIB_DIR}/sparse/QuadTree.c
    ${GRAPHVIZ_LIB_DIR}/sparse/SparseMatrix.c
    ${GRAPHVIZ_LIB_DIR}/sparse/vector.c
)

include_directories(
    ${GRAPHVIZ_LIB_DIR}
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
)

