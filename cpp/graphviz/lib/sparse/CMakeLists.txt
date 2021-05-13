add_library(sparse STATIC
    # Header files
    ${GRAPHVIZ_LIB_DIR}/sparse/BinaryHeap.h
    ${GRAPHVIZ_LIB_DIR}/sparse/clustering.h
    ${GRAPHVIZ_LIB_DIR}/sparse/color_palette.h
    ${GRAPHVIZ_LIB_DIR}/sparse/colorutil.h
    ${GRAPHVIZ_LIB_DIR}/sparse/DotIO.h
    ${GRAPHVIZ_LIB_DIR}/sparse/general.h
    ${GRAPHVIZ_LIB_DIR}/sparse/IntStack.h
    ${GRAPHVIZ_LIB_DIR}/sparse/LinkedList.h
    ${GRAPHVIZ_LIB_DIR}/sparse/mq.h
    ${GRAPHVIZ_LIB_DIR}/sparse/QuadTree.h
    ${GRAPHVIZ_LIB_DIR}/sparse/SparseMatrix.h
    ${GRAPHVIZ_LIB_DIR}/sparse/vector.h

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

target_include_directories(sparse PRIVATE
    ${GRAPHVIZ_LIB_DIR}
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
)

