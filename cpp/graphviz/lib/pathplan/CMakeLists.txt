add_library(pathplan STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/pathplan/cvt.c
    ${GRAPHVIZ_LIB_DIR}/pathplan/inpoly.c
    ${GRAPHVIZ_LIB_DIR}/pathplan/route.c
    ${GRAPHVIZ_LIB_DIR}/pathplan/shortest.c
    ${GRAPHVIZ_LIB_DIR}/pathplan/shortestpth.c
    ${GRAPHVIZ_LIB_DIR}/pathplan/solvers.c
    ${GRAPHVIZ_LIB_DIR}/pathplan/triang.c
    ${GRAPHVIZ_LIB_DIR}/pathplan/util.c
    ${GRAPHVIZ_LIB_DIR}/pathplan/visibility.c
)

include_directories(
    ${GRAPHVIZ_LIB_DIR}
    ${GRAPHVIZ_LIB_DIR}/pathplan
)
