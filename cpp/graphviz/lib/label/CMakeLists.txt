PROJECT(label)

SET(SRCS
    ${GRAPHVIZSRC_DIRS}/lib/label/index.c
    ${GRAPHVIZSRC_DIRS}/lib/label/node.c
    ${GRAPHVIZSRC_DIRS}/lib/label/rectangle.c
    ${GRAPHVIZSRC_DIRS}/lib/label/xlabels.c
    ${GRAPHVIZSRC_DIRS}/lib/label/split.q.c
)
    
INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/lib/label
    ${GRAPHVIZSRC_DIRS}/lib/common
    ${GRAPHVIZSRC_DIRS}/lib/cgraph
    ${GRAPHVIZSRC_DIRS}/lib/cdt
)

ADD_LIBRARY(label STATIC
    ${SRCS}
)

TARGET_LINK_LIBRARIES(label
    common
    cgraph
    cdt
)
