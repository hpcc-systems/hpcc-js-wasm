PROJECT(cgraph) 

SET(SRCS 
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/agerror.c
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/agxbuf.c
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/apply.c
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/attr.c
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/edge.c
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/flatten.c
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/grammar.c
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/graph.c
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/id.c
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/imap.c
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/io.c
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/mem.c
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/node.c
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/obj.c
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/pend.c
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/rec.c
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/refstr.c
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/scan.c
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/subg.c
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/utils.c
    ${GRAPHVIZSRC_DIRS}/lib/cgraph/write.c
)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/lib/cgraph
    ${GRAPHVIZSRC_DIRS}/lib/cdt
    ${GRAPHVIZSRC_DIRS}/lib/common
)

ADD_LIBRARY(cgraph STATIC
    ${SRCS} 
)

TARGET_LINK_LIBRARIES(cgraph 
    cdt
    common
)