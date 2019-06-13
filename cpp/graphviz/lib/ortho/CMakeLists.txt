PROJECT(ortho)

SET(SRCS
    ${GRAPHVIZSRC_DIRS}/lib/ortho/fPQ.c
    ${GRAPHVIZSRC_DIRS}/lib/ortho/fPQ.h
    ${GRAPHVIZSRC_DIRS}/lib/ortho/maze.c
    ${GRAPHVIZSRC_DIRS}/lib/ortho/maze.h
    ${GRAPHVIZSRC_DIRS}/lib/ortho/ortho.c
    ${GRAPHVIZSRC_DIRS}/lib/ortho/ortho.h
    ${GRAPHVIZSRC_DIRS}/lib/ortho/partition.c
    ${GRAPHVIZSRC_DIRS}/lib/ortho/partition.h
    ${GRAPHVIZSRC_DIRS}/lib/ortho/rawgraph.c
    ${GRAPHVIZSRC_DIRS}/lib/ortho/rawgraph.h
    ${GRAPHVIZSRC_DIRS}/lib/ortho/sgraph.c
    ${GRAPHVIZSRC_DIRS}/lib/ortho/sgraph.h
    ${GRAPHVIZSRC_DIRS}/lib/ortho/structures.h
    ${GRAPHVIZSRC_DIRS}/lib/ortho/trap.h
    ${GRAPHVIZSRC_DIRS}/lib/ortho/trapezoid.c
)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/lib/ortho
    ${GRAPHVIZSRC_DIRS}/lib/common
    ${GRAPHVIZSRC_DIRS}/lib/gvc
    ${GRAPHVIZSRC_DIRS}/lib/pathplan
    ${GRAPHVIZSRC_DIRS}/lib/cgraph
    ${GRAPHVIZSRC_DIRS}/lib/cdt
)

ADD_LIBRARY(ortho STATIC
    ${SRCS}
)

TARGET_LINK_LIBRARIES(ortho
    common
    gvc
    pathplan
    cgraph
    cdt
)
