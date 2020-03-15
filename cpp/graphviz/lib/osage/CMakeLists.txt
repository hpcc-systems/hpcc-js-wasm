INCLUDE_DIRECTORIES(
    ${GRAPHVIZ_LIB_DIR}/osage
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
    ${GRAPHVIZ_LIB_DIR}/fdpgen
    ${GRAPHVIZ_LIB_DIR}/gvc
    ${GRAPHVIZ_LIB_DIR}/neatogen
    ${GRAPHVIZ_LIB_DIR}/pack
    ${GRAPHVIZ_LIB_DIR}/pathplan
    ${GRAPHVIZ_LIB_DIR}/sfdpgen
    ${GRAPHVIZ_LIB_DIR}/sparse
)

ADD_LIBRARY(osage STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/osage/osageinit.c
)

