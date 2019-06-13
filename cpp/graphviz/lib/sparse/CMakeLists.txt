PROJECT(sparse)

SET(SRCS
    ${GRAPHVIZSRC_DIRS}/lib/sparse/general.c
    ${GRAPHVIZSRC_DIRS}/lib/sparse/QuadTree.c
    ${GRAPHVIZSRC_DIRS}/lib/sparse/QuadTree.h
    ${GRAPHVIZSRC_DIRS}/lib/sparse/SparseMatrix.c
    ${GRAPHVIZSRC_DIRS}/lib/sparse/LinkedList.c
)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/lib/sparse
    ${GRAPHVIZSRC_DIRS}/lib/common
    ${GRAPHVIZSRC_DIRS}/lib/cgraph
    ${GRAPHVIZSRC_DIRS}/lib/cdt
)

ADD_LIBRARY(sparse STATIC
    ${SRCS}
)

TARGET_LINK_LIBRARIES(sparse
    common
    cgraph
    cdt
)
