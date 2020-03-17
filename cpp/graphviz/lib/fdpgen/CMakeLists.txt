INCLUDE_DIRECTORIES(
    ${GRAPHVIZ_LIB_DIR}/fdpgen
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
    ${GRAPHVIZ_LIB_DIR}/gvc
    ${GRAPHVIZ_LIB_DIR}/neatogen
    ${GRAPHVIZ_LIB_DIR}/pack
    ${GRAPHVIZ_LIB_DIR}/pathplan
    ${GRAPHVIZ_LIB_DIR}/sparse
)

ADD_LIBRARY(fdpgen STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/fdpgen/clusteredges.c
    ${GRAPHVIZ_LIB_DIR}/fdpgen/comp.c
    ${GRAPHVIZ_LIB_DIR}/fdpgen/dbg.c
    ${GRAPHVIZ_LIB_DIR}/fdpgen/fdpinit.c
    ${GRAPHVIZ_LIB_DIR}/fdpgen/grid.c
    ${GRAPHVIZ_LIB_DIR}/fdpgen/layout.c
    ${GRAPHVIZ_LIB_DIR}/fdpgen/tlayout.c
    ${GRAPHVIZ_LIB_DIR}/fdpgen/xlayout.c
)

