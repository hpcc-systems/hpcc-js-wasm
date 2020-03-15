INCLUDE_DIRECTORIES(
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZSRC_DIRS}/build/lib/cgraph
    ${GRAPHVIZ_LIB_DIR}/cdt
)

ADD_LIBRARY(cgraph STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/cgraph/agerror.c
    ${GRAPHVIZ_LIB_DIR}/cgraph/agxbuf.c
    ${GRAPHVIZ_LIB_DIR}/cgraph/apply.c
    ${GRAPHVIZ_LIB_DIR}/cgraph/attr.c
    ${GRAPHVIZ_LIB_DIR}/cgraph/edge.c
    ${GRAPHVIZ_LIB_DIR}/cgraph/flatten.c
    ${GRAPHVIZ_LIB_DIR}/cgraph/graph.c
    ${GRAPHVIZ_LIB_DIR}/cgraph/id.c
    ${GRAPHVIZ_LIB_DIR}/cgraph/imap.c
    ${GRAPHVIZ_LIB_DIR}/cgraph/io.c
    ${GRAPHVIZ_LIB_DIR}/cgraph/mem.c
    ${GRAPHVIZ_LIB_DIR}/cgraph/node.c
    ${GRAPHVIZ_LIB_DIR}/cgraph/obj.c
    ${GRAPHVIZ_LIB_DIR}/cgraph/pend.c
    ${GRAPHVIZ_LIB_DIR}/cgraph/rec.c
    ${GRAPHVIZ_LIB_DIR}/cgraph/refstr.c
    ${GRAPHVIZ_LIB_DIR}/cgraph/subg.c
    ${GRAPHVIZ_LIB_DIR}/cgraph/utils.c
    ${GRAPHVIZ_LIB_DIR}/cgraph/write.c

    # Generated files
    ${GRAPHVIZSRC_DIRS}/build/lib/cgraph/grammar.c
    ${GRAPHVIZSRC_DIRS}/build/lib/cgraph/scan.c
)

TARGET_LINK_LIBRARIES(cgraph cdt)
