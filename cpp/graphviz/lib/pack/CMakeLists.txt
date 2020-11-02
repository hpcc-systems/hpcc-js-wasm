add_library(pack STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/pack/ccomps.c
    ${GRAPHVIZ_LIB_DIR}/pack/pack.c
)

include_directories(
    ${GRAPHVIZ_LIB_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
    ${GRAPHVIZ_LIB_DIR}/gvc
    ${GRAPHVIZ_LIB_DIR}/pathplan
)

