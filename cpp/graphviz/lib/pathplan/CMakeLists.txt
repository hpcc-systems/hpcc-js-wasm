PROJECT(pathplan)

SET(SRCS
    ${GRAPHVIZSRC_DIRS}/lib/pathplan/cvt.c
    ${GRAPHVIZSRC_DIRS}/lib/pathplan/inpoly.c
    ${GRAPHVIZSRC_DIRS}/lib/pathplan/route.c
    ${GRAPHVIZSRC_DIRS}/lib/pathplan/shortest.c
    ${GRAPHVIZSRC_DIRS}/lib/pathplan/shortestpth.c
    ${GRAPHVIZSRC_DIRS}/lib/pathplan/solvers.c
    ${GRAPHVIZSRC_DIRS}/lib/pathplan/triang.c
    ${GRAPHVIZSRC_DIRS}/lib/pathplan/util.c
    ${GRAPHVIZSRC_DIRS}/lib/pathplan/visibility.c
)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/lib/pathplan
    ${GRAPHVIZSRC_DIRS}/lib/cgraph
)

ADD_LIBRARY(pathplan STATIC
    ${SRCS}
)

TARGET_LINK_LIBRARIES(pathplan
    cgraph
)
