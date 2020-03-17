INCLUDE_DIRECTORIES(
    ${GRAPHVIZ_LIB_DIR}/patchwork
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
    ${GRAPHVIZ_LIB_DIR}/fdpgen
    ${GRAPHVIZ_LIB_DIR}/gvc
    ${GRAPHVIZ_LIB_DIR}/neatogen
    ${GRAPHVIZ_LIB_DIR}/pack
    ${GRAPHVIZ_LIB_DIR}/pathplan
    ${GRAPHVIZ_LIB_DIR}/sparse
)

ADD_LIBRARY(patchwork STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/patchwork/patchwork.c
    ${GRAPHVIZ_LIB_DIR}/patchwork/patchworkinit.c
    ${GRAPHVIZ_LIB_DIR}/patchwork/tree_map.c
)

