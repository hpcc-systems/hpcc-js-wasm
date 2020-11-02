add_definitions(-D_BLD_gvc=1)

add_library(ortho STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/ortho/fPQ.c
    ${GRAPHVIZ_LIB_DIR}/ortho/maze.c
    ${GRAPHVIZ_LIB_DIR}/ortho/ortho.c
    ${GRAPHVIZ_LIB_DIR}/ortho/partition.c
    ${GRAPHVIZ_LIB_DIR}/ortho/rawgraph.c
    ${GRAPHVIZ_LIB_DIR}/ortho/sgraph.c
    ${GRAPHVIZ_LIB_DIR}/ortho/trapezoid.c
)

include_directories(
    ${GRAPHVIZ_LIB_DIR}
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
    ${GRAPHVIZ_LIB_DIR}/gvc
    ${GRAPHVIZ_LIB_DIR}/pack
    ${GRAPHVIZ_LIB_DIR}/pathplan
)

