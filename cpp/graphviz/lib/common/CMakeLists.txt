PROJECT(common)

SET(SRCS
    ${GRAPHVIZSRC_DIRS}/lib/common/args.c
    ${GRAPHVIZSRC_DIRS}/lib/common/arrows.c
    ${GRAPHVIZSRC_DIRS}/lib/common/colxlate.c
    ${GRAPHVIZSRC_DIRS}/lib/common/emit.c
    ${GRAPHVIZSRC_DIRS}/lib/common/ellipse.c
    ${GRAPHVIZSRC_DIRS}/lib/common/geom.c
    ${GRAPHVIZSRC_DIRS}/lib/common/globals.c
    ${GRAPHVIZSRC_DIRS}/lib/common/htmllex.c
    ${GRAPHVIZSRC_DIRS}/lib/common/htmlparse.c
    ${GRAPHVIZSRC_DIRS}/lib/common/htmltable.c
    ${GRAPHVIZSRC_DIRS}/lib/common/input.c
    ${GRAPHVIZSRC_DIRS}/lib/common/intset.c
    ${GRAPHVIZSRC_DIRS}/lib/common/labels.c
    ${GRAPHVIZSRC_DIRS}/lib/common/memory.c
    ${GRAPHVIZSRC_DIRS}/lib/common/ns.c
    ${GRAPHVIZSRC_DIRS}/lib/common/output.c
    ${GRAPHVIZSRC_DIRS}/lib/common/pointset.c
    ${GRAPHVIZSRC_DIRS}/lib/common/postproc.c
    ${GRAPHVIZSRC_DIRS}/lib/common/psusershape.c
    ${GRAPHVIZSRC_DIRS}/lib/common/routespl.c
    ${GRAPHVIZSRC_DIRS}/lib/common/shapes.c
    ${GRAPHVIZSRC_DIRS}/lib/common/splines.c
    ${GRAPHVIZSRC_DIRS}/lib/common/taper.c
    ${GRAPHVIZSRC_DIRS}/lib/common/textspan.c
    ${GRAPHVIZSRC_DIRS}/lib/common/timing.c
    ${GRAPHVIZSRC_DIRS}/lib/common/utils.c
)
    
INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/lib/common
    ${GRAPHVIZSRC_DIRS}/lib/cdt
    ${GRAPHVIZSRC_DIRS}/lib/cgraph
    ${GRAPHVIZSRC_DIRS}/lib/fdpgen
    ${GRAPHVIZSRC_DIRS}/lib/pathplan
    ${GRAPHVIZSRC_DIRS}/lib/gvc
    ${GRAPHVIZSRC_DIRS}/lib/xdot
    ${GRAPHVIZSRC_DIRS}/lib/label
)

ADD_LIBRARY(common STATIC
    ${SRCS}
)

TARGET_LINK_LIBRARIES(common
    cdt
    cgraph
    fdpgen
    pathplan
    gvc
    xdot
    label
)
