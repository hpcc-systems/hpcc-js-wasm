INCLUDE_DIRECTORIES(
    ${GRAPHVIZ_LIB_DIR}/pack
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
    ${GRAPHVIZ_LIB_DIR}/gvc
    ${GRAPHVIZ_LIB_DIR}/neatogen
    ${GRAPHVIZ_LIB_DIR}/pathplan
)

ADD_LIBRARY(pack STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/pack/ccomps.c
    ${GRAPHVIZ_LIB_DIR}/pack/pack.c
)

