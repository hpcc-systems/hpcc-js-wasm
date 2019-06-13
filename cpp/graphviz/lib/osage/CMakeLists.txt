PROJECT(osage)

SET(SRCS
    ${GRAPHVIZSRC_DIRS}/lib/osage/osageinit.c
)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/lib/osage
    ${GRAPHVIZSRC_DIRS}/lib/common
    ${GRAPHVIZSRC_DIRS}/lib/cgraph
    ${GRAPHVIZSRC_DIRS}/lib/neatogen
    ${GRAPHVIZSRC_DIRS}/lib/pack
    ${GRAPHVIZSRC_DIRS}/lib/gvc
    ${GRAPHVIZSRC_DIRS}/lib/cdt
    ${GRAPHVIZSRC_DIRS}/lib/pathplan
    ${GRAPHVIZSRC_DIRS}/lib/sparse
)

ADD_LIBRARY(osage STATIC
    ${SRCS}
)

TARGET_LINK_LIBRARIES(osage
    common
    cgraph
    neatogen
    pack
    gvc
    cdt
    pathplan
    sparse
)
