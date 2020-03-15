INCLUDE_DIRECTORIES(${GRAPHVIZ_LIB_DIR}/cdt)

ADD_LIBRARY(cdt STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/cdt/dtclose.c
    ${GRAPHVIZ_LIB_DIR}/cdt/dtdisc.c
    ${GRAPHVIZ_LIB_DIR}/cdt/dtextract.c
    ${GRAPHVIZ_LIB_DIR}/cdt/dtflatten.c
    ${GRAPHVIZ_LIB_DIR}/cdt/dthash.c
    ${GRAPHVIZ_LIB_DIR}/cdt/dtlist.c
    ${GRAPHVIZ_LIB_DIR}/cdt/dtmethod.c
    ${GRAPHVIZ_LIB_DIR}/cdt/dtopen.c
    ${GRAPHVIZ_LIB_DIR}/cdt/dtrenew.c
    ${GRAPHVIZ_LIB_DIR}/cdt/dtrestore.c
    ${GRAPHVIZ_LIB_DIR}/cdt/dtsize.c
    ${GRAPHVIZ_LIB_DIR}/cdt/dtstat.c
    ${GRAPHVIZ_LIB_DIR}/cdt/dtstrhash.c
    ${GRAPHVIZ_LIB_DIR}/cdt/dttree.c
    ${GRAPHVIZ_LIB_DIR}/cdt/dtview.c
    ${GRAPHVIZ_LIB_DIR}/cdt/dtwalk.c
)

