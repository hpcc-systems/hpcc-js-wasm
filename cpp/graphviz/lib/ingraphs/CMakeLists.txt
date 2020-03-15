INCLUDE_DIRECTORIES(
    ${GRAPHVIZ_LIB_DIR}/ingraphs
    ${GRAPHVIZ_LIB_DIR}/cgraph
)

ADD_LIBRARY(ingraphs STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/ingraphs/ingraphs.c
)
