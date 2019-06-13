PROJECT(pack)

SET(SRCS
    ${GRAPHVIZSRC_DIRS}/lib/pack/ccomps.c
    ${GRAPHVIZSRC_DIRS}/lib/pack/pack.c
)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/lib/pack
    ${GRAPHVIZSRC_DIRS}/lib/common
    ${GRAPHVIZSRC_DIRS}/lib/cgraph
    ${GRAPHVIZSRC_DIRS}/lib/pathplan
    ${GRAPHVIZSRC_DIRS}/lib/cdt
    ${GRAPHVIZSRC_DIRS}/lib/neatogen
    ${GRAPHVIZSRC_DIRS}/lib/gvc
)

ADD_LIBRARY(pack STATIC
    ${SRCS}
)

TARGET_LINK_LIBRARIES(pack
    common
    cgraph
    pathplan
    cdt
    neatogen
    gvc
)
