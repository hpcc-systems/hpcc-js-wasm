PROJECT(twopigen)

SET(SRCS
    ${GRAPHVIZSRC_DIRS}/lib/twopigen/circle.c
    ${GRAPHVIZSRC_DIRS}/lib/twopigen/twopiinit.c
)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/lib/twopigen
    ${GRAPHVIZSRC_DIRS}/lib/common
    ${GRAPHVIZSRC_DIRS}/lib/cgraph
    ${GRAPHVIZSRC_DIRS}/lib/neatogen
    ${GRAPHVIZSRC_DIRS}/lib/gvc
    ${GRAPHVIZSRC_DIRS}/lib/cdt
    ${GRAPHVIZSRC_DIRS}/lib/pathplan
    ${GRAPHVIZSRC_DIRS}/lib/pack
    ${GRAPHVIZSRC_DIRS}/lib/sparse
)

ADD_LIBRARY(twopigen STATIC
    ${SRCS}
)

TARGET_LINK_LIBRARIES(twopigen
    common
    cgraph
    neatogen
    gvc
    cdt
    pathplan
    pack
    sparse
)
