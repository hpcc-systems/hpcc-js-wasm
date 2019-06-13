PROJECT(circogen)

SET(SRCS
    ${GRAPHVIZSRC_DIRS}/lib/circogen/block.c
    ${GRAPHVIZSRC_DIRS}/lib/circogen/blockpath.c
    ${GRAPHVIZSRC_DIRS}/lib/circogen/blocktree.c
    ${GRAPHVIZSRC_DIRS}/lib/circogen/circpos.c
    ${GRAPHVIZSRC_DIRS}/lib/circogen/circular.c
    ${GRAPHVIZSRC_DIRS}/lib/circogen/circularinit.c
    ${GRAPHVIZSRC_DIRS}/lib/circogen/deglist.c
    ${GRAPHVIZSRC_DIRS}/lib/circogen/edgelist.c
    ${GRAPHVIZSRC_DIRS}/lib/circogen/nodelist.c
    ${GRAPHVIZSRC_DIRS}/lib/circogen/nodeset.c
)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/lib/circogen
    ${GRAPHVIZSRC_DIRS}/lib/common
    ${GRAPHVIZSRC_DIRS}/lib/cgraph
    ${GRAPHVIZSRC_DIRS}/lib/neatogen
    ${GRAPHVIZSRC_DIRS}/lib/gvc
    ${GRAPHVIZSRC_DIRS}/lib/pack
    ${GRAPHVIZSRC_DIRS}/lib/cdt
    ${GRAPHVIZSRC_DIRS}/lib/pathplan
    ${GRAPHVIZSRC_DIRS}/lib/sparse
)

ADD_LIBRARY(circogen STATIC
    ${SRCS}
)

TARGET_LINK_LIBRARIES(circogen
    common
    cgraph
    neatogen
    gvc
    pack
    cdt
    pathplan
    sparse
)
