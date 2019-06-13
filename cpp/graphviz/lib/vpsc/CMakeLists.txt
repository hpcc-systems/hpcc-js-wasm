PROJECT(vpsc)

SET(SRCS
    ${GRAPHVIZSRC_DIRS}/lib/vpsc/block.cpp
    ${GRAPHVIZSRC_DIRS}/lib/vpsc/block.h
    ${GRAPHVIZSRC_DIRS}/lib/vpsc/blocks.cpp
    ${GRAPHVIZSRC_DIRS}/lib/vpsc/blocks.h
    ${GRAPHVIZSRC_DIRS}/lib/vpsc/constraint.cpp
    ${GRAPHVIZSRC_DIRS}/lib/vpsc/constraint.h
    ${GRAPHVIZSRC_DIRS}/lib/vpsc/csolve_VPSC.cpp
    ${GRAPHVIZSRC_DIRS}/lib/vpsc/csolve_VPSC.h
    ${GRAPHVIZSRC_DIRS}/lib/vpsc/generate-constraints.cpp
    ${GRAPHVIZSRC_DIRS}/lib/vpsc/generate-constraints.h
    ${GRAPHVIZSRC_DIRS}/lib/vpsc/remove_rectangle_overlap.cpp
    ${GRAPHVIZSRC_DIRS}/lib/vpsc/remove_rectangle_overlap.h
    ${GRAPHVIZSRC_DIRS}/lib/vpsc/solve_VPSC.cpp
    ${GRAPHVIZSRC_DIRS}/lib/vpsc/solve_VPSC.h
    ${GRAPHVIZSRC_DIRS}/lib/vpsc/variable.cpp
    ${GRAPHVIZSRC_DIRS}/lib/vpsc/variable.h
)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/lib/vpsc
)

ADD_LIBRARY(vpsc STATIC
    ${SRCS}
)

TARGET_LINK_LIBRARIES(vpsc
)
