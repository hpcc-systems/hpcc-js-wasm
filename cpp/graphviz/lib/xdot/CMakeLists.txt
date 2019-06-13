PROJECT(xdot) 

SET(SRCS 
    ${GRAPHVIZSRC_DIRS}/lib/xdot/xdot.c
)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/lib/xdot
    ${GRAPHVIZSRC_DIRS}/lib/common
    ${GRAPHVIZSRC_DIRS}/lib/cgraph
    ${GRAPHVIZSRC_DIRS}/lib/cdt
)

ADD_LIBRARY(xdot STATIC
    ${SRCS} 
)

TARGET_LINK_LIBRARIES(xdot 
    common
    cgraph
    cdt
)
