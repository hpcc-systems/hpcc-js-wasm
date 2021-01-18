add_library(patchwork STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/patchwork/patchwork.c
    ${GRAPHVIZ_LIB_DIR}/patchwork/patchworkinit.c
    ${GRAPHVIZ_LIB_DIR}/patchwork/tree_map.c
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
