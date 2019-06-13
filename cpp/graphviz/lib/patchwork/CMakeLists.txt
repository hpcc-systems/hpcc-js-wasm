PROJECT(patchwork)

SET(SRCS
    ${GRAPHVIZSRC_DIRS}/lib/patchwork/patchwork.c
    ${GRAPHVIZSRC_DIRS}/lib/patchwork/patchworkinit.c
    ${GRAPHVIZSRC_DIRS}/lib/patchwork/tree_map.c
)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/lib/patchwork
    ${GRAPHVIZSRC_DIRS}/lib/common
    ${GRAPHVIZSRC_DIRS}/lib/cgraph
    ${GRAPHVIZSRC_DIRS}/lib/neatogen
    ${GRAPHVIZSRC_DIRS}/lib/pack
    ${GRAPHVIZSRC_DIRS}/lib/fdpgen
    ${GRAPHVIZSRC_DIRS}/lib/gvc
    ${GRAPHVIZSRC_DIRS}/lib/cdt
    ${GRAPHVIZSRC_DIRS}/lib/pathplan
    ${GRAPHVIZSRC_DIRS}/lib/sparse
)

ADD_LIBRARY(patchwork STATIC
    ${SRCS}
)

TARGET_LINK_LIBRARIES(patchwork
    common
    cgraph
    neatogen
    pack
    fdpgen
    gvc
    cdt
    pathplan
    sparse
)
