PROJECT(cdt)

SET(SRCS
    ${GRAPHVIZSRC_DIRS}/lib/cdt/dttree.c
    ${GRAPHVIZSRC_DIRS}/lib/cdt/dtclose.c
    ${GRAPHVIZSRC_DIRS}/lib/cdt/dtdisc.c
    ${GRAPHVIZSRC_DIRS}/lib/cdt/dtextract.c
    ${GRAPHVIZSRC_DIRS}/lib/cdt/dtflatten.c
    ${GRAPHVIZSRC_DIRS}/lib/cdt/dthash.c
    ${GRAPHVIZSRC_DIRS}/lib/cdt/dtlist.c
    ${GRAPHVIZSRC_DIRS}/lib/cdt/dtmethod.c
    ${GRAPHVIZSRC_DIRS}/lib/cdt/dtopen.c
    ${GRAPHVIZSRC_DIRS}/lib/cdt/dtrenew.c
    ${GRAPHVIZSRC_DIRS}/lib/cdt/dtrestore.c
    ${GRAPHVIZSRC_DIRS}/lib/cdt/dtsize.c
    ${GRAPHVIZSRC_DIRS}/lib/cdt/dtstat.c
    ${GRAPHVIZSRC_DIRS}/lib/cdt/dtstrhash.c
    ${GRAPHVIZSRC_DIRS}/lib/cdt/dtview.c
    ${GRAPHVIZSRC_DIRS}/lib/cdt/dtwalk.c
)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/lib/cdt
)

ADD_LIBRARY(cdt STATIC
    ${SRCS}
)

TARGET_LINK_LIBRARIES(cdt
)
