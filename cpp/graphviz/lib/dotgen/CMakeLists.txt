PROJECT(dotgen)

SET(SRCS
    ${GRAPHVIZSRC_DIRS}/lib/dotgen/acyclic.c
    ${GRAPHVIZSRC_DIRS}/lib/dotgen/aspect.c
    ${GRAPHVIZSRC_DIRS}/lib/dotgen/class1.c
    ${GRAPHVIZSRC_DIRS}/lib/dotgen/class2.c
    ${GRAPHVIZSRC_DIRS}/lib/dotgen/cluster.c
    ${GRAPHVIZSRC_DIRS}/lib/dotgen/compound.c
    ${GRAPHVIZSRC_DIRS}/lib/dotgen/conc.c
    ${GRAPHVIZSRC_DIRS}/lib/dotgen/decomp.c
    ${GRAPHVIZSRC_DIRS}/lib/dotgen/dotinit.c
    ${GRAPHVIZSRC_DIRS}/lib/dotgen/dotsplines.c
    ${GRAPHVIZSRC_DIRS}/lib/dotgen/fastgr.c
    ${GRAPHVIZSRC_DIRS}/lib/dotgen/flat.c
    ${GRAPHVIZSRC_DIRS}/lib/dotgen/mincross.c
    ${GRAPHVIZSRC_DIRS}/lib/dotgen/position.c
    ${GRAPHVIZSRC_DIRS}/lib/dotgen/rank.c
    ${GRAPHVIZSRC_DIRS}/lib/dotgen/sameport.c
)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/lib/dotgen
    ${GRAPHVIZSRC_DIRS}/lib/common
    ${GRAPHVIZSRC_DIRS}/lib/cgraph
    ${GRAPHVIZSRC_DIRS}/lib/cdt
    ${GRAPHVIZSRC_DIRS}/lib/pathplan
    ${GRAPHVIZSRC_DIRS}/lib/gvc
    ${GRAPHVIZSRC_DIRS}/lib/ortho
    ${GRAPHVIZSRC_DIRS}/lib/pack
)


ADD_LIBRARY(dotgen STATIC
    ${SRCS}
)

TARGET_LINK_LIBRARIES(dotgen
    common
    cgraph
    cdt
    pathplan
    gvc
    ortho
    pack
)
