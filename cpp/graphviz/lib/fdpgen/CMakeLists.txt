PROJECT(fdpgen)

SET(SRCS
    ${GRAPHVIZSRC_DIRS}/lib/fdpgen/clusteredges.c
    ${GRAPHVIZSRC_DIRS}/lib/fdpgen/comp.c
    ${GRAPHVIZSRC_DIRS}/lib/fdpgen/dbg.c
    ${GRAPHVIZSRC_DIRS}/lib/fdpgen/fdpinit.c
    ${GRAPHVIZSRC_DIRS}/lib/fdpgen/grid.c
    ${GRAPHVIZSRC_DIRS}/lib/fdpgen/layout.c
    ${GRAPHVIZSRC_DIRS}/lib/fdpgen/tlayout.c
    ${GRAPHVIZSRC_DIRS}/lib/fdpgen/xlayout.c
)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/lib/fdpgen
    ${GRAPHVIZSRC_DIRS}/lib/common
    ${GRAPHVIZSRC_DIRS}/lib/cgraph
    ${GRAPHVIZSRC_DIRS}/lib/neatogen
    ${GRAPHVIZSRC_DIRS}/lib/cdt
    ${GRAPHVIZSRC_DIRS}/lib/pathplan
    ${GRAPHVIZSRC_DIRS}/lib/pack
    ${GRAPHVIZSRC_DIRS}/lib/gvc
    ${GRAPHVIZSRC_DIRS}/lib/sparse
)

ADD_LIBRARY(fdpgen STATIC
    ${SRCS}
)

TARGET_LINK_LIBRARIES(fdpgen
    common
    cgraph
    neatogen
    cdt
    pathplan
    pack
    gvc
    sparse
)
