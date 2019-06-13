PROJECT(sfdpgen)

SET(SRCS
    ${GRAPHVIZSRC_DIRS}/lib/sfdpgen/Multilevel.c
    ${GRAPHVIZSRC_DIRS}/lib/sfdpgen/Multilevel.h
    ${GRAPHVIZSRC_DIRS}/lib/sfdpgen/post_process.c
    ${GRAPHVIZSRC_DIRS}/lib/sfdpgen/post_process.h
    ${GRAPHVIZSRC_DIRS}/lib/sfdpgen/PriorityQueue.c
    ${GRAPHVIZSRC_DIRS}/lib/sfdpgen/PriorityQueue.h
    ${GRAPHVIZSRC_DIRS}/lib/sfdpgen/sfdp.h
    ${GRAPHVIZSRC_DIRS}/lib/sfdpgen/sfdpinit.c
    ${GRAPHVIZSRC_DIRS}/lib/sfdpgen/sfdpinternal.h
    ${GRAPHVIZSRC_DIRS}/lib/sfdpgen/sparse_solve.c
    ${GRAPHVIZSRC_DIRS}/lib/sfdpgen/sparse_solve.h
    ${GRAPHVIZSRC_DIRS}/lib/sfdpgen/spring_electrical.c
    ${GRAPHVIZSRC_DIRS}/lib/sfdpgen/stress_model.c
    ${GRAPHVIZSRC_DIRS}/lib/sfdpgen/uniform_stress.c
)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/lib/sfdpgen
    ${GRAPHVIZSRC_DIRS}/lib/common
    ${GRAPHVIZSRC_DIRS}/lib/cgraph
    ${GRAPHVIZSRC_DIRS}/lib/neatogen
    ${GRAPHVIZSRC_DIRS}/lib/cdt
    ${GRAPHVIZSRC_DIRS}/lib/pathplan
    ${GRAPHVIZSRC_DIRS}/lib/pack
    ${GRAPHVIZSRC_DIRS}/lib/gvc
    ${GRAPHVIZSRC_DIRS}/lib/sparse
)

ADD_LIBRARY(sfdpgen STATIC
    ${SRCS}
)

TARGET_LINK_LIBRARIES(sfdpgen
    common
    cgraph
    neatogen
    cdt
    pathplan
    pack
    gvc
    sparse
)
