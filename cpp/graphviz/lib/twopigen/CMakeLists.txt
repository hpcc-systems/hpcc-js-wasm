INCLUDE_DIRECTORIES(
    ${GRAPHVIZ_LIB_DIR}/twopigen
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
    ${GRAPHVIZ_LIB_DIR}/gvc
    ${GRAPHVIZ_LIB_DIR}/neatogen
    ${GRAPHVIZ_LIB_DIR}/pack
    ${GRAPHVIZ_LIB_DIR}/pathplan
    ${GRAPHVIZ_LIB_DIR}/sparse
)

ADD_LIBRARY(twopigen STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/twopigen/circle.c
    ${GRAPHVIZ_LIB_DIR}/twopigen/twopiinit.c
)

