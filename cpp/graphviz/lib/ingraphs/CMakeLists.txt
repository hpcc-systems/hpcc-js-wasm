add_library(ingraphs STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/ingraphs/ingraphs.c
)

include_directories(
    ${GRAPHVIZ_LIB_DIR}
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
)

